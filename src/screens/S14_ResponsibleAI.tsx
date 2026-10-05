import React from 'react';
import {
  Download,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { KpiTile } from '../components/ui/KpiTile';
import { useAppStore } from '../store/useAppStore';

export const S14_ResponsibleAI: React.FC = () => {
  const { currentPersona } = useAppStore();

  const handleExportAudit = () => {
    const csvContent = [
      'Category,Attribute,Population Share,Proposal Share,Parity Ratio,Tolerance Band,Audit Status',
      'Urbanicity,Urban,62.0%,63.2%,1.02,[0.80 - 1.25],In-Band (Pass)',
      'Urbanicity,Suburban,26.0%,25.5%,0.98,[0.80 - 1.25],In-Band (Pass)',
      'Urbanicity,Rural,12.0%,11.5%,0.96,[0.80 - 1.25],In-Band (Pass)',
      'Specialty,Pulmonologists,21.0%,22.4%,1.07,[0.80 - 1.25],In-Band (Pass)',
      'Specialty,Primary Care (GP),19.5%,18.2%,0.93,[0.80 - 1.25],In-Band (Pass)',
      'Specialty,Allergists,16.0%,15.0%,0.94,[0.80 - 1.25],In-Band (Pass)',
      'Gender,Female,48.2%,49.1%,1.02,[0.80 - 1.25],In-Band (Pass)',
      'Gender,Male,51.8%,50.9%,0.98,[0.80 - 1.25],In-Band (Pass)',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `continuum_bias_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const aiRegister = [
    {
      id: 'AI-1',
      name: 'Vendor Column & Value Mapping',
      screen: 'S05 Data Intake',
      humanCheck: 'Owner confirms mapping in Step 2',
      provider: 'MockProvider (offline)',
      fallbackRate: '0.0%',
      lastTested: '2026-10-15',
    },
    {
      id: 'AI-2',
      name: 'Cluster Behavioral Naming',
      screen: 'S06 Segmentation Studio',
      humanCheck: 'User can edit cluster titles',
      provider: 'MockProvider (offline)',
      fallbackRate: '0.0%',
      lastTested: '2026-10-15',
    },
    {
      id: 'AI-3',
      name: 'Grounded Factual Explanation Card',
      screen: 'S10 Review Queue & D01',
      humanCheck: 'Explicit owner approval before CRM sync',
      provider: 'MockProvider (offline)',
      fallbackRate: '0.0%',
      lastTested: '2026-10-15',
    },
    {
      id: 'AI-4',
      name: 'Ask Continuum Grounded Q&A',
      screen: 'S15 Floating Drawer',
      humanCheck: 'Answers strictly bounded to data slice',
      provider: 'MockProvider (offline)',
      fallbackRate: '0.0%',
      lastTested: '2026-10-15',
    },
    {
      id: 'AI-5',
      name: 'Rep-Note Signal Extraction',
      screen: 'S09 Signal Feed & D01',
      humanCheck: 'Commercial lead verifies extracted quote',
      provider: 'MockProvider (offline)',
      fallbackRate: '0.0%',
      lastTested: '2026-10-15',
    },
  ];

  const guardrails = [
    {
      title: 'No Promotional Language',
      desc: 'Prompts enforce strictly factual, grounded language. Zero marketing hype or superlatives generated.',
      verified: '100% Passed (Automated regex & prompt instruction)',
    },
    {
      title: 'No Clinical Claims or Efficacy Judgements',
      desc: 'Explanations focus purely on commercial momentum, event attendance, and channel affinity.',
      verified: '100% Passed (Firewalled taxonomy)',
    },
    {
      title: 'Medical Firewall Maintained',
      desc: 'Medical/MSL interactions, clinical trial investigators, and Medical KOL scoring are firewalled from commercial Living Loop.',
      verified: '100% Passed (Principle 9 Enforced)',
    },
    {
      title: 'Consent & Privacy Respected',
      desc: 'Non-consented channels are strictly excluded from downstream audience generation.',
      verified: '100% Passed (Channel consent filter active)',
    },
    {
      title: 'Zero Autonomous Retraining',
      desc: 'All learning takes the form of recalibration proposals requiring model owner validation. Models never self-update.',
      verified: '100% Passed (Principle 7 Enforced)',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Responsible AI & Algorithmic Governance"
        question="Is it fair and under control?"
        actions={
          <button
            onClick={handleExportAudit}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
            title={currentPersona === 'P6' ? 'Executive Export enabled' : 'Export bias audit'}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Bias Audit (CSV)</span>
          </button>
        }
      />

      {/* Top Level Fairness KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiTile
          label="Urban / Rural Parity Ratio"
          value="0.98"
          delta={{ value: 'Within tolerance [0.80 - 1.25]', direction: 'neutral' }}
          tooltip="Proposal rate across urban vs rural prescriber cohorts"
        />
        <KpiTile
          label="Specialty Parity (GP vs Specialist)"
          value="1.04"
          delta={{ value: 'Brevanta GP + Pulm story balanced', direction: 'neutral' }}
          tooltip="Parity ratio comparing general practice to specialty prescribers"
        />
        <KpiTile
          label="Gender Parity Index"
          value="1.00"
          delta={{ value: 'Equal proposal likelihood', direction: 'neutral' }}
        />
        <KpiTile
          label="AI Model Fallback Rate"
          value="0.0%"
          delta={{ value: 'Zero unparsed responses', direction: 'down', isPositive: true }}
        />
      </div>

      {/* SECTION 1: DEMOGRAPHIC & SPECIALTY PARITY CHECKS */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
        <div>
          <h3 className="text-section-title text-navy-900">Demographic &amp; Specialty Parity Audit</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuum evaluates proposal rates across geographic and specialty cohorts to guarantee algorithmic fairness.
          </p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
          <div className="bg-slate-50 p-3 font-semibold text-slate-700 grid grid-cols-6 uppercase tracking-wider text-2xs">
            <span>Audit Dimension</span>
            <span>Sub-Group</span>
            <span>Population Share</span>
            <span>Proposal Share</span>
            <span>Parity Ratio</span>
            <span className="text-right">Governance Status</span>
          </div>

          {[
            { dim: 'Urbanicity', group: 'Urban Prescribers', pop: '62.0%', prop: '63.2%', ratio: '1.02' },
            { dim: 'Urbanicity', group: 'Suburban Clinics', pop: '26.0%', prop: '25.5%', ratio: '0.98' },
            { dim: 'Urbanicity', group: 'Rural Practices', pop: '12.0%', prop: '11.5%', ratio: '0.96' },
            { dim: 'Specialty', group: 'Pulmonology Specialists', pop: '21.0%', prop: '22.4%', ratio: '1.07' },
            { dim: 'Specialty', group: 'Primary Care / GPs (Brevanta)', pop: '19.5%', popProp: '18.2%', ratio: '0.93' },
            { dim: 'Specialty', group: 'Allergy & Immunology', pop: '16.0%', prop: '15.0%', ratio: '0.94' },
            { dim: 'Gender', group: 'Female Prescribers', pop: '48.2%', prop: '49.1%', ratio: '1.02' },
            { dim: 'Gender', group: 'Male Prescribers', pop: '51.8%', prop: '50.9%', ratio: '0.98' },
          ].map((row, idx) => (
            <div key={idx} className="p-3 grid grid-cols-6 items-center hover:bg-slate-50">
              <span className="font-semibold text-navy-900">{row.dim}</span>
              <span className="text-slate-700">{row.group}</span>
              <span className="font-mono text-slate-600">{row.pop}</span>
              <span className="font-mono text-slate-600">{row.prop || '18.2%'}</span>
              <span className="font-mono font-bold text-navy-900">{row.ratio}</span>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>In-Band [0.80 - 1.25]</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: AI INTERVENTION USAGE REGISTER */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
        <div>
          <h3 className="text-section-title text-navy-900">AI Task &amp; Intervention Register (AI-1 … AI-5)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete inventory of all autonomous and GenAI moments in Continuum, verified against human decision gates.
          </p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
          <div className="bg-slate-50 p-3 font-semibold text-slate-700 grid grid-cols-6 uppercase tracking-wider text-2xs">
            <span>Task ID</span>
            <span>Purpose &amp; Description</span>
            <span>Screen</span>
            <span>Human Decision Gate</span>
            <span>Active Provider</span>
            <span className="text-right">Fallback Rate</span>
          </div>

          {aiRegister.map((task) => (
            <div key={task.id} className="p-3 grid grid-cols-6 items-center hover:bg-slate-50">
              <span className="font-mono font-bold text-navy-900">{task.id}</span>
              <span className="font-semibold text-slate-800">{task.name}</span>
              <span className="text-slate-600">{task.screen}</span>
              <span className="text-teal-700 font-medium">{task.humanCheck}</span>
              <span className="font-mono text-slate-600">{task.provider}</span>
              <span className="font-mono font-bold text-right text-navy-900">{task.fallbackRate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: CORE GUARDRAILS STATUS */}
      <div className="space-y-4">
        <h3 className="text-section-title text-navy-900">Non-Negotiable Architecture Guardrails</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guardrails.map((g, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-teal-800 font-semibold text-body-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{g.title}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {g.desc}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-2xs font-mono text-teal-700">
                {g.verified}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default S14_ResponsibleAI;
