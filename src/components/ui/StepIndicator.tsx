import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface StepItem {
  step: number;
  title: string;
  description?: string;
}

export const HERO_STEPS: StepItem[] = [
  { step: 1, title: 'Three Markets, Three Realities', description: 'Non-comparable legacy segmentation processes' },
  { step: 2, title: 'Data Realities', description: 'Readiness & data quality divergence across markets' },
  { step: 3, title: 'Onboard Market C', description: 'Intake messy vendor Excel and AI mapping' },
  { step: 4, title: 'Segmentation Studio', description: 'K-Means (MKT_A) and Rules Template (MKT_C)' },
  { step: 5, title: 'Opportunity & Accounts', description: 'Cross-market insight & opportunity gap matrix' },
  { step: 6, title: 'Living Loop', description: 'Formulary win propagation & Dr. Vogel living change' },
  { step: 7, title: 'Publish to CRM', description: 'Write-back execution & downstream consumer impact' },
  { step: 8, title: 'Govern & Prove Value', description: 'Segment health, audit trail, bias checks & value calculator' },
];

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  steps?: StepItem[];
  onStepChange: (step: number) => void;
  compact?: boolean;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 8,
  steps = HERO_STEPS,
  onStepChange,
  compact = false,
  className = '',
}) => {
  const currentStepInfo = steps.find((s) => s.step === currentStep) || {
    step: currentStep,
    title: `Step ${currentStep}`,
  };

  const handlePrev = () => {
    if (currentStep > 1) onStepChange(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) onStepChange(currentStep + 1);
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 bg-navy-900/60 border border-gold-500/50 rounded-lg px-2.5 py-1 text-xs text-white ${className}`}>
        <span className="text-gold-500 font-semibold tracking-wide">
          Step {currentStep}/{totalSteps}:
        </span>
        <span className="font-medium truncate max-w-[200px]" title={currentStepInfo.title}>
          {currentStepInfo.title}
        </span>
        <div className="flex items-center gap-0.5 ml-1 border-l border-slate-700 pl-1.5">
          <button
            onClick={handlePrev}
            disabled={currentStep <= 1}
            className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Previous step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep >= totalSteps}
            className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gold-500 hover:text-white"
            title="Next step"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full horizontal step progress bar
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-semibold text-gold-500 uppercase tracking-wider">
            Guided Tour · Step {currentStep} of {totalSteps}
          </span>
          <h3 className="text-sm font-bold text-navy-900 mt-0.5">{currentStepInfo.title}</h3>
          {currentStepInfo.description && (
            <p className="text-xs text-slate-500 mt-0.5">{currentStepInfo.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStep <= 1}
            className="flex items-center gap-1 px-2.5 py-1 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep >= totalSteps}
            className="flex items-center gap-1 px-3 py-1 bg-gold-500 hover:bg-gold-500/90 text-navy-900 rounded text-xs font-semibold shadow-2xs disabled:opacity-40"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1.5 pt-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
          const isCurrent = s === currentStep;
          const isDone = s < currentStep;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onStepChange(s)}
              className={`h-1.5 rounded-full transition-all ${
                isCurrent
                  ? 'bg-gold-500 ring-2 ring-gold-500/40'
                  : isDone
                  ? 'bg-teal-600'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Jump to step ${s}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
