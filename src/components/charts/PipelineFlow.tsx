import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  Cpu,
  Database,
  Lock,
} from 'lucide-react';
import { InterventionBadge, InterventionType } from '../ui/InterventionBadge';

export interface PipelineStageCounts {
  events?: number;
  flags?: number;
  cards?: number;
  proposals?: number;
  holds?: number;
  writtenBack?: number;
}

export interface PipelineFlowProps {
  title: string;
  soWhat: string;
  xAxisLabel: string;
  yAxisLabel: string;
  counts?: PipelineStageCounts;
  activeStage?: number;
  onStageClick?: (stageId: number, stageKey: string) => void;
  className?: string;
}

interface StageConfig {
  id: number;
  key: string;
  number: string;
  title: string;
  description: string;
  interventions: InterventionType[];
  countKey: keyof PipelineStageCounts;
  defaultCount: number;
  outputLabel: string;
  isHumanGate?: boolean;
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({
  title,
  soWhat,
  xAxisLabel,
  yAxisLabel,
  counts = {},
  activeStage,
  onStageClick,
  className = '',
}) => {
  const stageCounts: Required<PipelineStageCounts> = {
    events: counts.events ?? 1240,
    flags: counts.flags ?? 312,
    cards: counts.cards ?? 312,
    proposals: counts.proposals ?? 186,
    holds: counts.holds ?? 41,
    writtenBack: counts.writtenBack ?? 97,
  };

  const stages: StageConfig[] = [
    {
      id: 1,
      key: 'signal-watch',
      number: '1',
      title: 'Signal watch',
      description: 'Scans sales, CRM notes & claims continuously',
      interventions: ['Agent', 'GenAI'],
      countKey: 'events',
      defaultCount: 1240,
      outputLabel: 'Change events',
    },
    {
      id: 2,
      key: 'drift-detection',
      number: '2',
      title: 'Drift detection',
      description: 'ML classifier computes drift probability & confidence',
      interventions: ['ML'],
      countKey: 'flags',
      defaultCount: 312,
      outputLabel: 'Drift flags + confidence',
    },
    {
      id: 3,
      key: 'explanation',
      number: '3',
      title: 'Explanation',
      description: 'Grounded drivers formulated in plain language',
      interventions: ['GenAI'],
      countKey: 'cards',
      defaultCount: 312,
      outputLabel: 'Explanation cards',
    },
    {
      id: 4,
      key: 'proposal-routing',
      number: '4',
      title: 'Proposal & routing',
      description: 'Rights matrix checks owner; routes for human sign-off',
      interventions: ['Rules', 'Human'],
      countKey: 'proposals',
      defaultCount: 186,
      outputLabel: 'Proposed segments',
      isHumanGate: true,
    },
    {
      id: 5,
      key: 'record-learn',
      number: '5',
      title: 'Record & learn',
      description: 'Audit log written; outcomes feed recalibration',
      interventions: ['ML'],
      countKey: 'writtenBack',
      defaultCount: 97,
      outputLabel: 'Audit trail · Recalibration',
    },
  ];

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-5 flex flex-col shadow-2xs ${className}`}>
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

      {/* 5-Stage Horizontal Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative mb-4">
        {stages.map((stage, idx) => {
          const currentCount = stageCounts[stage.countKey];
          const isActive = activeStage === stage.id;
          const isGold = stage.isHumanGate;

          return (
            <div
              key={stage.id}
              onClick={() => onStageClick?.(stage.id, stage.key)}
              className={`relative rounded-lg p-3.5 flex flex-col justify-between transition-all duration-200 border-2 ${
                isGold
                  ? 'bg-amber-50/40 border-gold-500 shadow-xs ring-1 ring-gold-400/50'
                  : isActive
                  ? 'bg-teal-50/40 border-teal-600 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              } ${onStageClick ? 'cursor-pointer' : ''}`}
            >
              {/* Stage header & number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-2xs font-bold ${
                        isGold ? 'bg-gold-500 text-navy-900' : 'bg-navy-900 text-white'
                      }`}
                    >
                      {stage.number}
                    </span>
                    <span className="font-semibold text-xs text-navy-900">{stage.title}</span>
                  </div>
                  {isGold && (
                    <span className="text-3xs font-bold uppercase tracking-wider bg-gold-200/80 text-amber-900 px-1.5 py-0.5 rounded">
                      Human Gate
                    </span>
                  )}
                </div>

                <p className="text-2xs text-slate-500 leading-snug line-clamp-2 min-h-[28px]">
                  {stage.description}
                </p>
              </div>

              {/* Counts & Volume Output */}
              <div className="my-3 py-2 border-y border-slate-200/70">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xl font-bold text-navy-900 tracking-tight">
                    {currentCount.toLocaleString()}
                  </span>
                  {stage.id === 4 && stageCounts.holds > 0 && (
                    <span className="text-2xs font-medium text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                      {stageCounts.holds} on hold
                    </span>
                  )}
                </div>
                <div className="text-2xs text-slate-400 mt-0.5 truncate font-medium">
                  → {stage.outputLabel}
                </div>
              </div>

              {/* AI Interventions Pill */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                {stage.interventions.map((intType) => (
                  <InterventionBadge key={intType} type={intType} size="sm" />
                ))}
              </div>

              {/* Connecting arrow for stages 1 to 4 on desktop */}
              {idx < 4 && (
                <div className="hidden md:flex absolute -right-2.5 top-1/2 transform -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white border border-slate-300 items-center justify-center text-slate-400 shadow-2xs">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Target write-back destination: CRM */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2 text-2xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>CRM Write-back:</span>
          <span className="font-mono font-bold text-navy-900">
            {stageCounts.writtenBack} approved changes written
          </span>
          <span className="text-teal-700 font-normal">(0 unapproved)</span>
        </div>
      </div>

      {/* Guardrails Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 mb-3 flex items-center justify-between text-2xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span className="font-medium text-navy-900">Stability Guardrails Enforced:</span>
          <span>90-day freeze windows · max 2 changes/year · conflicting signals routed to Hold</span>
        </div>
        <div className="text-slate-400 text-3xs font-mono">POLICY: STAB-01</div>
      </div>

      {/* Feedback Loop Arrow & Explanation */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-md p-2 mb-3 flex items-center gap-2 text-2xs text-indigo-900">
        <RotateCcw className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
        <span>
          <strong className="font-semibold text-indigo-950">Controlled Learning Loop:</strong> Human
          decisions (approvals, overrides, rejections) calibrate drift thresholds. No unmoderated
          autonomous re-clustering.
        </span>
      </div>

      {/* "Who decides" Band */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-2 text-2xs">
        <div className="flex items-center gap-2 p-1.5 rounded bg-teal-50/60 border border-teal-100 text-teal-900">
          <Cpu className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
          <div>
            <strong className="font-semibold block">Runs on its own:</strong>
            <span className="text-teal-800">Signal watch & drift detection classifiers</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded bg-amber-50/60 border border-amber-200 text-amber-900">
          <UserCheck className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
          <div>
            <strong className="font-semibold block">Needs human approval:</strong>
            <span className="text-amber-800">All customer segment changes before CRM write</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
          <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <div>
            <strong className="font-semibold block">Stays human-owned:</strong>
            <span className="text-slate-600">Global dimension standards & stability policies</span>
          </div>
        </div>
      </div>

      {/* Axis Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
        <div>
          <span className="font-medium text-slate-500">Service Pipeline (X):</span> {xAxisLabel}
        </div>
        <div>
          <span className="font-medium text-slate-500">Metric Output (Y):</span> {yAxisLabel}
        </div>
      </div>
    </div>
  );
};
