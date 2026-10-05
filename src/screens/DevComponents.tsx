import React, { useState } from 'react';
import {
  KpiTile,
  StatusBadge,
  ConfidenceChip,
  SegmentAgeChip,
  InterventionBadge,
  ApproverPill,
  AIBadge,
  DataTable,
  Column,
  FilterBar,
  FilterState,
  Tabs,
  TabItem,
  Modal,
  ConfirmChangeModal,
  Drawer,
  EmptyState,
  Toast,
  StepIndicator,
} from '../components/ui';
import {
  BarChartComponent,
  LineChartComponent,
  DonutChart,
  Heatmap,
  Funnel,
  Sankey,
  BoxPlot,
  Matrix4x4,
  PipelineFlow,
} from '../components/charts';
import { Layers } from 'lucide-react';

export const DevComponents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ui');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // FilterBar state
  const [filters, setFilters] = useState<FilterState>({
    market: 'ALL',
    brand: 'AUR',
    customerType: 'ALL',
    searchQuery: '',
    statusFilter: 'All',
  });

  // Tab definitions
  const tabs: TabItem[] = [
    { id: 'ui', label: 'UI Components' },
    { id: 'charts', label: 'Chart Components' },
    { id: 'feedback', label: 'Modals & Drawers' },
    { id: 'empty-states', label: 'Empty States' },
  ];

  // DataTable sample
  interface SampleHcp {
    id: string;
    name: string;
    specialty: string;
    market: string;
    segment: string;
    prescribingDecile: number;
    age: number;
    status: 'Proposed' | 'Approved' | 'Held';
  }

  const sampleHcps: SampleHcp[] = [
    {
      id: 'HCP-A-0001',
      name: 'Dr. Sarah Jenkins',
      specialty: 'Dermatology',
      market: 'Market A',
      segment: 'Segment A',
      prescribingDecile: 9,
      age: 42,
      status: 'Proposed',
    },
    {
      id: 'HCP-A-0002',
      name: 'Dr. Michael Chen',
      specialty: 'Rheumatology',
      market: 'Market A',
      segment: 'Segment B',
      prescribingDecile: 8,
      age: 110,
      status: 'Approved',
    },
    {
      id: 'HCP-B-0014',
      name: 'Dr. Elena Rostova',
      specialty: 'Oncology',
      market: 'Market B',
      segment: 'Segment C',
      prescribingDecile: 6,
      age: 195,
      status: 'Held',
    },
  ];

  const columns: Column<SampleHcp>[] = [
    { key: 'id', header: 'HCP ID', sortable: true },
    { key: 'name', header: 'Clinician Name', sortable: true },
    { key: 'specialty', header: 'Specialty', sortable: true },
    { key: 'market', header: 'Market', sortable: true },
    {
      key: 'segment',
      header: 'Segment',
      render: (row: SampleHcp) => (
        <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-xs">
          {row.segment}
        </span>
      ),
    },
    {
      key: 'prescribingDecile',
      header: 'Decile (1–10)',
      align: 'right',
      sortable: true,
      render: (row: SampleHcp) => <span className="font-mono">{row.prescribingDecile}</span>,
    },
    {
      key: 'age',
      header: 'Segment Age',
      render: (row: SampleHcp) => <SegmentAgeChip days={row.age} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: SampleHcp) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-navy-900 text-white rounded-lg p-6 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-teal-600/30 text-teal-300 border border-teal-500/40 rounded text-2xs font-mono uppercase tracking-widest font-semibold">
              Design System Review
            </span>
            <span className="text-slate-400 text-xs">/dev/components</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white tracking-tight">
            Continuum Component Showcase
          </h1>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl font-normal">
            Verifying all UI widgets, data visualisations, governance badges, and modal dialogues
            against PROJECT_BRIEF Section 12 specifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AIBadge providerName="MockProvider" />
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ---------------- SECTION 1: UI COMPONENTS ---------------- */}
      {activeTab === 'ui' && (
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>StepIndicator (Guided Demo 1–8)</span>
            </h2>
            <StepIndicator
              currentStep={3}
              totalSteps={8}
              onStepChange={(s: number) => setToastMessage(`Navigating to Step ${s}`)}
            />
          </div>

          {/* KPI Tiles */}
          <div>
            <h2 className="text-sm font-bold text-navy-900 mb-3">KPI Tiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiTile
                label="Segments Current (<90d)"
                value="74.2%"
                delta={{ value: '+5.4%', isPositive: true }}
                tooltip="Increasing proportion of targets refreshed within living SLA"
              />
              <KpiTile
                label="Median Segment Age"
                value="68 days"
                delta={{ value: '-12 days', isPositive: true }}
                tooltip="Down from 182 days under legacy annual cycle"
              />
              <KpiTile
                label="Proposals Approved"
                value="142"
                delta={{ value: '+18 this week', isPositive: true }}
                tooltip="Commercial Excellence and Reps cleared queue"
              />
              <KpiTile
                label="Unapproved Write-backs"
                value="0"
                delta={{ value: '100% compliant', isPositive: true }}
                tooltip="Zero changes written back to CRM without human approval"
              />
            </div>
          </div>

          {/* Badges and Chips Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Badges */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
                StatusBadge Variants
              </h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="Draft" />
                <StatusBadge status="Approved" />
                <StatusBadge status="Active" />
                <StatusBadge status="Retired" />
                <StatusBadge status="Proposed" />
                <StatusBadge status="Held" />
                <StatusBadge status="Rejected" />
                <StatusBadge status="Written back" />
              </div>
            </div>

            {/* Confidence & Segment Age Chips */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
                Confidence & Segment Age Chips
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <ConfidenceChip confidence="High" />
                <ConfidenceChip confidence="Medium" />
                <ConfidenceChip confidence="Low" />
                <ConfidenceChip confidence="Medium" gapFilled />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SegmentAgeChip days={45} />
                <SegmentAgeChip days={120} />
                <SegmentAgeChip days={210} />
              </div>
            </div>

            {/* AI Intervention Badges */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
                Intervention Badges (Exact Hex Colors)
              </h3>
              <div className="flex flex-wrap gap-2">
                <InterventionBadge type="Agent" />
                <InterventionBadge type="ML" />
                <InterventionBadge type="GenAI" />
                <InterventionBadge type="Rules" />
                <InterventionBadge type="Human" />
              </div>
            </div>

            {/* Governance Approver Pills & AI Badge */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
                Approver Pills & AI Attribution
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <ApproverPill role="Global Segmentation Lead" />
                <ApproverPill role="Commercial Excellence" />
                <ApproverPill role="Field Rep" />
                <AIBadge providerName="MockProvider" />
              </div>
            </div>
          </div>

          {/* FilterBar & DataTable */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-navy-900">FilterBar & DataTable</h2>
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              showCustomerType={true}
              showStatusFilter={true}
              onReset={() =>
                setFilters({
                  market: 'ALL',
                  brand: 'AUR',
                  customerType: 'ALL',
                  searchQuery: '',
                  statusFilter: 'All',
                })
              }
            />
            <DataTable
              data={sampleHcps}
              columns={columns}
              rowKey={(row) => row.id}
              onRowClick={(row) => setToastMessage(`Selected clinician: ${row.name}`)}
            />
          </div>
        </div>
      )}

      {/* ---------------- SECTION 2: CHARTS ---------------- */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Pipeline Flow (Signature Component) */}
          <PipelineFlow
            title="Living Segmentation Service Architecture Flow"
            soWhat="Continuous event-driven pipeline moving signals from detection through gold human gate to CRM"
            xAxisLabel="Service Pipeline Architecture"
            yAxisLabel="Volume of Entities Processed"
            counts={{
              events: 1240,
              flags: 312,
              cards: 312,
              proposals: 186,
              holds: 41,
              writtenBack: 97,
            }}
            onStageClick={(id, key) => setToastMessage(`Navigating to Stage ${id}: ${key}`)}
          />

          {/* Funnel & Donut in 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Funnel
              title="Living Loop Funnel: Aurelix (Launch)"
              soWhat="Conversion through pipeline stages with human gate review"
              xAxisLabel="Funnel Pipeline Stages"
              yAxisLabel="HCP Count"
              stages={[
                { name: '1 Signal Watch', count: 1240, subtext: 'Raw trigger events' },
                { name: '2 Drift Flags', count: 312, subtext: 'ML verified drift' },
                { name: '3 Proposed Changes', count: 186, subtext: 'Ready for owner', holdCount: 41 },
                { name: '4 Approved Changes', count: 145, subtext: 'Human sign-off' },
                { name: '5 CRM Written Back', count: 97, subtext: 'Synced to Veeva' },
              ]}
              onStageClick={(s) => setToastMessage(`Clicked stage: ${s.name}`)}
            />

            <DonutChart
              title="Segment Share Distribution (Market B)"
              soWhat="Launch portfolio balanced across Tier A-E segments"
              data={[
                { name: 'Segment A', value: 480, color: '#0E7C86' },
                { name: 'Segment B', value: 820, color: '#5B6ABF' },
                { name: 'Segment C', value: 1100, color: '#E9B44C' },
                { name: 'Segment D', value: 950, color: '#B0603C' },
                { name: 'Segment E', value: 650, color: '#5C7080' },
              ]}
              centerLabel="Total Universe"
              centerValue="4,000"
            />
          </div>

          {/* Bar & Line in 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BarChartComponent
              title="Segment Age Distribution by Market"
              soWhat="Market A near-continuous refresh vs Market C annual vendor cycle"
              xAxisLabel="Market Cohort"
              yAxisLabel="HCP Count"
              data={[
                { name: 'Market A', fresh: 6200, medium: 1400, stale: 400 },
                { name: 'Market B', fresh: 2500, medium: 1100, stale: 400 },
                { name: 'Market C', fresh: 200, medium: 450, stale: 850 },
              ]}
              series={[
                { dataKey: 'fresh', name: '<90 days (Fresh)', color: '#0E7C86', stackId: 'age' },
                { dataKey: 'medium', name: '90–180 days (Amber)', color: '#E9B44C', stackId: 'age' },
                { dataKey: 'stale', name: '>180 days (Stale)', color: '#B03A2E', stackId: 'age' },
              ]}
            />

            <LineChartComponent
              title="Time to Update: Living vs Legacy Cycle"
              soWhat="Living pipeline reduces update latency from 180+ days to 14 days"
              xAxisLabel="Calendar Month (2026)"
              yAxisLabel="Median Days from Signal to CRM"
              data={[
                { name: 'Jan', living: 28, legacy: 185 },
                { name: 'Mar', living: 21, legacy: 180 },
                { name: 'May', living: 16, legacy: 190 },
                { name: 'Jul', living: 14, legacy: 175 },
                { name: 'Sep', living: 12, legacy: 180 },
              ]}
              series={[
                { dataKey: 'living', name: 'Continuum Living Loop', color: '#0E7C86' },
                { dataKey: 'legacy', name: 'Legacy Annual Agency Cycle', color: '#B0603C' },
              ]}
            />
          </div>

          {/* Heatmap & Matrix4x4 in 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Heatmap
              title="Market Data Readiness Heatmap"
              soWhat="Data realities dictate methods: Market A K-means vs Market C PMR rules"
              xAxisLabel="Data Sources"
              yAxisLabel="Markets"
              rows={[
                { id: 'MKT_A', label: 'Market A', sublabel: 'Data-rich' },
                { id: 'MKT_B', label: 'Market B', sublabel: 'Signal-enriched' },
                { id: 'MKT_C', label: 'Market C', sublabel: 'Survey-led' },
              ]}
              columns={[
                { id: 'sales', label: 'Sales/Rx' },
                { id: 'claims', label: 'Claims/Access' },
                { id: 'crm', label: 'CRM Notes' },
                { id: 'digital', label: 'Digital Affinity' },
                { id: 'pmr', label: 'PMR Survey' },
              ]}
              data={[
                { rowId: 'MKT_A', colId: 'sales', value: 'Full', status: 'available' },
                { rowId: 'MKT_A', colId: 'claims', value: 'Full', status: 'available' },
                { rowId: 'MKT_A', colId: 'crm', value: 'Active', status: 'available' },
                { rowId: 'MKT_A', colId: 'digital', value: 'High', status: 'available' },
                { rowId: 'MKT_A', colId: 'pmr', value: 'Optional', status: 'partial' },
                { rowId: 'MKT_B', colId: 'sales', value: 'Brick-only', status: 'partial' },
                { rowId: 'MKT_B', colId: 'claims', value: 'None', status: 'none' },
                { rowId: 'MKT_B', colId: 'crm', value: 'Rich', status: 'available' },
                { rowId: 'MKT_B', colId: 'digital', value: 'Consented', status: 'available' },
                { rowId: 'MKT_B', colId: 'pmr', value: 'Periodic', status: 'partial' },
                { rowId: 'MKT_C', colId: 'sales', value: 'None', status: 'none' },
                { rowId: 'MKT_C', colId: 'claims', value: 'None', status: 'none' },
                { rowId: 'MKT_C', colId: 'crm', value: 'Rep notes', status: 'partial' },
                { rowId: 'MKT_C', colId: 'digital', value: 'None', status: 'none' },
                { rowId: 'MKT_C', colId: 'pmr', value: 'Primary', status: 'available' },
              ]}
              onCellClick={(cell) => setToastMessage(`Heatmap cell: ${cell.rowId} × ${cell.colId}`)}
            />

            <Matrix4x4
              title="Opportunity Matrix: Potential × Adoption"
              soWhat="Highlights priority gap: high-potential clinicians stalled in early stages"
              xAxisLabel="Adoption Stage"
              yAxisLabel="Potential Tier (1–4)"
              data={[
                { potential: 1, adoptionStage: 'Awareness', count: 85, isOpportunityGap: true },
                { potential: 1, adoptionStage: 'Consideration', count: 120, isOpportunityGap: true },
                { potential: 1, adoptionStage: 'Trial', count: 210 },
                { potential: 1, adoptionStage: 'Adoption', count: 340 },
                { potential: 2, adoptionStage: 'Awareness', count: 140, isOpportunityGap: true },
                { potential: 2, adoptionStage: 'Consideration', count: 220 },
                { potential: 2, adoptionStage: 'Trial', count: 310 },
                { potential: 2, adoptionStage: 'Adoption', count: 420 },
                { potential: 3, adoptionStage: 'Awareness', count: 260 },
                { potential: 3, adoptionStage: 'Consideration', count: 380 },
                { potential: 3, adoptionStage: 'Trial', count: 290 },
                { potential: 3, adoptionStage: 'Adoption', count: 210 },
                { potential: 4, adoptionStage: 'Awareness', count: 310 },
                { potential: 4, adoptionStage: 'Consideration', count: 240 },
                { potential: 4, adoptionStage: 'Trial', count: 150 },
                { potential: 4, adoptionStage: 'Adoption', count: 80 },
              ]}
              onCellClick={(c) =>
                setToastMessage(`Tier ${c.potential} in ${c.adoptionStage}: ${c.count} HCPs`)
              }
            />
          </div>

          {/* Sankey & BoxPlot in 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Sankey
              title="Segment Migration (Version 1.2 → 2.0)"
              soWhat="Tracks movement of customers following formulary expansion and digital surge"
              xAxisLabel="V1.2 Active → V2.0 Proposed"
              yAxisLabel="Customer Flow Volume"
              nodes={[
                { id: 'v1-a', name: 'V1.2 Seg A', color: '#0E7C86' },
                { id: 'v1-b', name: 'V1.2 Seg B', color: '#5B6ABF' },
                { id: 'v1-c', name: 'V1.2 Seg C', color: '#E9B44C' },
                { id: 'v2-a', name: 'V2.0 Seg A', color: '#0E7C86' },
                { id: 'v2-b', name: 'V2.0 Seg B', color: '#5B6ABF' },
                { id: 'v2-c', name: 'V2.0 Seg C', color: '#E9B44C' },
              ]}
              links={[
                { source: 'v1-a', target: 'v2-a', value: 320 },
                { source: 'v1-a', target: 'v2-b', value: 60 },
                { source: 'v1-b', target: 'v2-a', value: 95 },
                { source: 'v1-b', target: 'v2-b', value: 410 },
                { source: 'v1-b', target: 'v2-c', value: 45 },
                { source: 'v1-c', target: 'v2-b', value: 80 },
                { source: 'v1-c', target: 'v2-c', value: 510 },
              ]}
              onLinkClick={(l) => setToastMessage(`Flow: ${l.value} HCPs migrating`)}
            />

            <BoxPlot
              title="Prescribing Volume (TRx) by Segment"
              soWhat="Clean separation between high-volume Segment A and broader Segments"
              xAxisLabel="Customer Segment"
              yAxisLabel="Annual TRx Volume"
              data={[
                { group: 'Segment A', min: 140, q1: 220, median: 310, q3: 420, max: 590, outliers: [680] },
                { group: 'Segment B', min: 90, q1: 150, median: 210, q3: 280, max: 390 },
                { group: 'Segment C', min: 40, q1: 85, median: 130, q3: 175, max: 240 },
                { group: 'Segment D', min: 15, q1: 45, median: 70, q3: 95, max: 150 },
                { group: 'Segment E', min: 5, q1: 15, median: 28, q3: 45, max: 80 },
              ]}
              onBoxClick={(b) => setToastMessage(`Median for ${b.group}: ${b.median} TRx`)}
            />
          </div>
        </div>
      )}

      {/* ---------------- SECTION 3: MODALS & DRAWERS ---------------- */}
      {activeTab === 'feedback' && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-navy-900">Interactive Overlays</h2>
          <p className="text-xs text-slate-500">
            Click below to inspect modal dialogues and drawers with governance context.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded text-xs font-semibold hover:bg-teal-700 transition"
            >
              Open Standard Modal
            </button>
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-4 py-2 bg-navy-900 text-white rounded text-xs font-semibold hover:bg-navy-800 transition"
            >
              Open Confirm Change Modal (Before → After)
            </button>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-semibold hover:bg-slate-200 transition"
            >
              Open Customer 360 Drawer
            </button>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Segmentation Studio Parameters"
          >
            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Studio clustering utilizes K-means (k=5) over normalized Rx volume, digital affinity,
                and PMR survey scores.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-2xs">
                Convergence reached at 14 iterations · inertia: 0.142
              </div>
            </div>
          </Modal>

          <ConfirmChangeModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={(reason) => {
              setIsConfirmModalOpen(false);
              setToastMessage(`Segment change confirmed with reason: ${reason || 'Approved'}`);
            }}
            title="Approve Aurelix Segment Promotion"
            customerName="Dr. Sarah Jenkins"
            customerId="HCP-A-0001"
            dimensionName="Aurelix Prescriber Segment"
            beforeValue="Segment B (Growth Prescriber)"
            afterValue="Segment A (High-Volume Champion)"
            approverRole="Market Back Office"
            actionType="approve"
          />

          <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="Customer 360 Preview: Dr. Elena Rostova"
            subtitle="HCP-B-0014 · Rheumatology · St. Jude Medical Center"
          >
            <div className="p-4 space-y-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <StatusBadge status="Held" />
                <ConfidenceChip confidence="Medium" />
                <SegmentAgeChip days={195} />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
                <strong>Stability Hold:</strong> Proposal temporarily delayed due to conflicting
                prescribing signals within the 90-day freeze window.
              </div>
            </div>
          </Drawer>
        </div>
      )}

      {/* ---------------- SECTION 4: EMPTY STATES ---------------- */}
      {activeTab === 'empty-states' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold text-navy-900 mb-2">Variant: Empty</h3>
            <EmptyState
              variant="empty"
              title="No Pending Proposals"
              description="All detected customer drifts have been approved or rejected by named owners."
            />
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold text-navy-900 mb-2">Variant: Loading</h3>
            <EmptyState
              variant="loading"
              title="Recalibrating Drift Model"
              description="Synthesising feedback decisions against ground truth Rx data..."
            />
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold text-navy-900 mb-2">
              Variant: Not Available in Market (Exact Proxy)
            </h3>
            <EmptyState
              variant="notAvailableInMarket"
              title="Prescribing Data Status"
            />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            toast={{
              id: 'dev-toast',
              type: 'info',
              message: toastMessage,
            }}
            onDismiss={() => setToastMessage(null)}
          />
        </div>
      )}
    </div>
  );
};

export default DevComponents;
