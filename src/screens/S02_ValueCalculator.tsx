import React, { useState } from 'react';
import {
  Info,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { KpiTile } from '../components/ui/KpiTile';
import { BarChartComponent, BarSeries } from '../components/charts/BarChart';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { formatCurrency } from '../utils/formatters';

export const S02_ValueCalculator: React.FC = () => {
  const { proposals, publishLog } = useAppStore();
  const aggregates = dataService.getFullAggregatesData();
  const levers = aggregates.value_levers;

  // State toggle: "Use demo actuals" vs "Custom input model"
  const [useDemoActuals, setUseDemoActuals] = useState<boolean>(true);

  // Dynamic parameters
  const [risingHcps, setRisingHcps] = useState<number>(levers.rising_opp_upgraded_hcps);
  const [weeksEarlier, setWeeksEarlier] = useState<number>(levers.rising_opp_weeks_earlier);
  const [valPerWeek, setValPerWeek] = useState<number>(levers.rising_opp_value_per_week);
  const [wastedCalls, setWastedCalls] = useState<number>(levers.declining_effort_calls);
  const [costPerCall, setCostPerCall] = useState<number>(levers.declining_effort_cost_per_interaction);
  const analystDays = 45;
  const numMarkets = 3;

  // When demo actuals is toggled, pull live approved and published counts
  const liveApprovedCount = proposals.filter((p) => p.status === 'Approved' || p.status === 'Written back').length;
  const livePublishedCount = publishLog.reduce((acc, l) => acc + l.records_written, 0);

  const effectiveRisingHcps = useDemoActuals
    ? levers.rising_opp_upgraded_hcps + (liveApprovedCount * 3)
    : risingHcps;

  const effectiveWastedCalls = useDemoActuals
    ? levers.declining_effort_calls + (livePublishedCount * 8)
    : wastedCalls;

  // Computations
  const earlierCaptureValue = effectiveRisingHcps * weeksEarlier * valPerWeek;
  const wastedCallsAvoidedValue = effectiveWastedCalls * costPerCall;
  const fieldAlignmentValue = (levers.field_acceptance_override_before - levers.field_acceptance_override_after) *
    levers.field_acceptance_planned_calls *
    levers.field_acceptance_value_per_call;
  const analystEffortValue = analystDays * numMarkets * 680 * levers.maintenance_savings_pct;

  const totalValue = earlierCaptureValue + wastedCallsAvoidedValue + fieldAlignmentValue + analystEffortValue;

  // Chart data
  const waterfallData = [
    { lever: 'Rising HCPs Captured', value: earlierCaptureValue },
    { lever: 'Wasted Calls Avoided', value: wastedCallsAvoidedValue },
    { lever: 'Field Alignment', value: fieldAlignmentValue },
    { lever: 'Analyst Effort Saved', value: analystEffortValue },
  ];

  const barSeries: BarSeries[] = [
    { dataKey: 'value', name: 'Value Contribution ($)', color: '#0E7C86' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Commercial Value Calculator"
        question="What is living segmentation worth?"
        actions={
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-xs font-semibold text-slate-700">Use Live Demo Actuals</span>
            <input
              type="checkbox"
              checked={useDemoActuals}
              onChange={(e) => setUseDemoActuals(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </div>
        }
      />

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label="Total Annual Value Unlocked"
          value={formatCurrency(totalValue)}
          delta={{
            value: useDemoActuals ? 'Live session actuals active' : 'Simulated projection',
            direction: 'up',
            isPositive: true,
          }}
          tooltip="Combined annual commercial value unlocked across all 4 living segmentation levers"
        />

        <KpiTile
          label="Earlier Capture of Rising HCPs"
          value={formatCurrency(earlierCaptureValue)}
          delta={{
            value: `${effectiveRisingHcps} prescribers × ${weeksEarlier} wks earlier`,
            direction: 'up',
            isPositive: true,
          }}
          tooltip="Revenue uplift from engaging fast-growing prescribers 9 weeks before annual planning refresh"
        />

        <KpiTile
          label="Wasted Calls Avoided"
          value={formatCurrency(wastedCallsAvoidedValue)}
          delta={{
            value: `${effectiveWastedCalls.toLocaleString()} calls reallocated`,
            direction: 'up',
            isPositive: true,
          }}
          tooltip="Sales representative effort saved by down-ranking declining prescribers"
        />

        <KpiTile
          label="Field Trust & Alignment"
          value={formatCurrency(fieldAlignmentValue)}
          delta={{
            value: 'Override rate down from 21% to 8%',
            direction: 'up',
            isPositive: true,
          }}
          tooltip="Commercial value gained from reps executing aligned targeting rather than overriding"
        />
      </div>

      {/* CHART & SLIDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Waterfall Chart */}
        <div className="lg:col-span-2">
          <BarChartComponent
            title="Living Segmentation Value Waterfall by Lever"
            soWhat="Earlier capture of rising innovators accounts for over 45% of total quantifiable economic impact."
            xAxisLabel="Value Lever"
            yAxisLabel="Economic Value (USD)"
            data={waterfallData}
            series={barSeries}
            height={340}
            formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
        </div>

        {/* Interactive Parameter Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-teal-600" />
            <h4 className="text-body-sm font-semibold text-navy-900">
              Interactive Value Assumptions
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>Rising Prescribers Upgraded:</span>
                <span className="font-mono font-bold text-navy-900">{effectiveRisingHcps}</span>
              </div>
              <input
                type="range"
                disabled={useDemoActuals}
                min={100}
                max={1000}
                value={effectiveRisingHcps}
                onChange={(e) => setRisingHcps(Number(e.target.value))}
                className="w-full accent-teal-600 mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>Weeks Earlier than Annual Refresh:</span>
                <span className="font-mono font-bold text-navy-900">{weeksEarlier} wks</span>
              </div>
              <input
                type="range"
                min={4}
                max={26}
                value={weeksEarlier}
                onChange={(e) => setWeeksEarlier(Number(e.target.value))}
                className="w-full accent-teal-600 mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>Value per Prescriber per Week:</span>
                <span className="font-mono font-bold text-navy-900">${valPerWeek}</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                value={valPerWeek}
                onChange={(e) => setValPerWeek(Number(e.target.value))}
                className="w-full accent-teal-600 mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>Wasted Details Avoided:</span>
                <span className="font-mono font-bold text-navy-900">{effectiveWastedCalls}</span>
              </div>
              <input
                type="range"
                disabled={useDemoActuals}
                min={500}
                max={6000}
                value={effectiveWastedCalls}
                onChange={(e) => setWastedCalls(Number(e.target.value))}
                className="w-full accent-teal-600 mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>Cost per Sales Interaction:</span>
                <span className="font-mono font-bold text-navy-900">${costPerCall}</span>
              </div>
              <input
                type="range"
                min={80}
                max={300}
                value={costPerCall}
                onChange={(e) => setCostPerCall(Number(e.target.value))}
                className="w-full accent-teal-600 mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ASSUMPTIONS PANEL */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="text-section-title text-navy-900">
            Plain Language Calculation Formulas (Illustrative Estimate)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-semibold text-navy-900">1. Earlier Capture of Rising Prescribers</div>
            <p className="font-mono text-2xs text-teal-800">
              Formula: Upgraded HCPs × Weeks Earlier Captured × Value/HCP/Week
            </p>
            <p>
              In annual cycles, prescribers who accelerate prescribing mid-year wait up to 12 months for tier promotion. Continuum identifies them in days.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-semibold text-navy-900">2. Wasted Effort on Declining Customers</div>
            <p className="font-mono text-2xs text-teal-800">
              Formula: Avoided Low-Yield Calls × Fully Loaded Cost per Detail
            </p>
            <p>
              Reps continue calling declining prescribers until formal cycle refreshes. Timely downgrades save commercial hours and travel costs.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-semibold text-navy-900">3. Field Targeting Alignment</div>
            <p className="font-mono text-2xs text-teal-800">
              Formula: (Override Rate Before - Override Rate After) × Planned Calls × Value/Call
            </p>
            <p>
              When the field trusts segments, rep overrides drop from 21% to 8%, reducing non-compliant territory drift.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-semibold text-navy-900">4. Operational &amp; Analytics Efficiency</div>
            <p className="font-mono text-2xs text-teal-800">
              Formula: Analyst Days × Markets × Daily Commercial Analyst Rate × 30% Savings
            </p>
            <p>
              Automates manual Excel vendor harmonization and data preprocessing cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S02_ValueCalculator;
