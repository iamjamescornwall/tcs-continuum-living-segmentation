import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { PersonaId, MarketCode, BrandCode } from '../../types';
import SettingsModal from './SettingsModal';
import AboutModal from './AboutModal';
import Toast from '../ui/Toast';
import {
  RotateCcw,
  Settings as SettingsIcon,
  Info,
  Play,
  ChevronRight,
  ChevronLeft,
  User,
  Sparkles,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();

  const {
    currentPersona,
    setPersona,
    currentMarket,
    setMarket,
    currentBrand,
    setBrand,
    guidedDemoActive,
    setGuidedDemoActive,
    guidedStep,
    setGuidedStep,
    resetDemo,
  } = useAppStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persona landing routes per Section 5.1
  const personaLandings: Record<PersonaId, string> = {
    P1: '/standards',
    P2: '/review-queue',
    P3: '/review-queue',
    P4: '/review-queue',
    P5: '/intake',
    P6: '/cockpit',
  };

  const handlePersonaChange = (newPersona: PersonaId) => {
    setPersona(newPersona);
    const landingRoute = personaLandings[newPersona] || '/cockpit';
    navigate(landingRoute);
    setToastMessage(`Switched persona to: ${getPersonaLabel(newPersona)}`);
  };

  const getPersonaLabel = (p: PersonaId): string => {
    switch (p) {
      case 'P1':
        return 'P1 · Global Segmentation Lead';
      case 'P2':
        return 'P2 · Market Back Office';
      case 'P3':
        return 'P3 · KAM / Account Lead';
      case 'P4':
        return 'P4 · Field Rep';
      case 'P5':
        return 'P5 · Local Agency (Vendor)';
      case 'P6':
        return 'P6 · Executive / Compliance';
      default:
        return p;
    }
  };

  // Guided demo 8-step hero paths per Section 7 & Phase C W2
  const heroSteps = [
    {
      step: 1,
      route: '/cockpit',
      persona: 'P6',
      market: 'ALL',
      brand: 'AUR',
      label: 'The Problem: Fragmented Markets',
      presenterNote: 'Show divergence between markets: in-house model vs separate tool vs agency Excel. Cockpit -> Standardisation -> Cross-market.',
      subRoutes: ['/cockpit', '/health?tab=standardisation', '/insights?tab=cross-market'],
    },
    {
      step: 2,
      route: '/market-data?tab=readiness',
      persona: 'P1',
      market: 'ALL',
      brand: 'AUR',
      label: 'Data Realities & Readiness',
      presenterNote: 'Explain why markets differ in data realities: Rx availability, consented digital, master match rate.',
      subRoutes: ['/market-data?tab=readiness', '/market-data?tab=data-quality'],
    },
    {
      step: 3,
      route: '/intake',
      persona: 'P5',
      market: 'MKT_C',
      brand: 'AUR',
      label: 'Onboard Market C Vendor File',
      presenterNote: 'Local agency uploads Excel file. AI-1 maps vendor columns to global standard with 92% match rate.',
      subRoutes: ['/intake'],
    },
    {
      step: 4,
      route: '/studio',
      persona: 'P1',
      market: 'MKT_A',
      brand: 'AUR',
      label: 'Studio: K-Means & Rules Template',
      presenterNote: 'Market C uses Potential Grid rules template; Market A runs K-means. Both versioned into library.',
      subRoutes: ['/studio', '/library', '/insights?tab=profiles'],
    },
    {
      step: 5,
      route: '/insights?tab=opportunity',
      persona: 'P2',
      market: 'ALL',
      brand: 'AUR',
      label: 'Opportunity Gaps & Accounts',
      presenterNote: 'Compare customer opportunity gaps, hospital group landscape, and cross-segmentation.',
      subRoutes: ['/insights?tab=opportunity', '/insights?tab=accounts', '/insights?tab=cross-segmentation'],
    },
    {
      step: 6,
      route: '/change-monitor?tab=pipeline',
      persona: 'P2',
      market: 'MKT_B',
      brand: 'AUR',
      label: 'Living Loop: Hero Dr. Vogel',
      presenterNote: 'Zentrova formulary win at hero account ACC-B-001 + rep note trigger drift. Dr. Vogel B->A approved with 4 drivers.',
      subRoutes: ['/change-monitor?tab=pipeline', '/change-monitor?tab=signal-feed', '/review-queue', '/customer/hcp/HCP-B-0001'],
    },
    {
      step: 7,
      route: '/publish',
      persona: 'P2',
      market: 'MKT_B',
      brand: 'AUR',
      label: 'Publish to CRM (Veeva Sync)',
      presenterNote: 'Publish approved proposals to Veeva CRM. Segment age resets to 0d. Downstream audiences shift.',
      subRoutes: ['/publish', '/insights?tab=targeting'],
    },
    {
      step: 8,
      route: '/health',
      persona: 'P6',
      market: 'ALL',
      brand: 'AUR',
      label: 'Govern & Prove Value',
      presenterNote: 'Full health metrics, audit trail with 0 unapproved write-backs, bias parity check, and $1.4M value calculator.',
      subRoutes: ['/health', '/audit', '/responsible-ai', '/value-calculator', '/cockpit'],
    },
  ];

  const currentStepConfig = heroSteps.find((s) => s.step === guidedStep) || heroSteps[0];

  const handleNextStep = () => {
    const nextStepNum = guidedStep >= 8 ? 1 : guidedStep + 1;
    setGuidedStep(nextStepNum);
    const stepConfig = heroSteps.find((s) => s.step === nextStepNum);
    if (stepConfig) {
      setPersona(stepConfig.persona as PersonaId);
      setMarket(stepConfig.market as MarketCode | 'ALL');
      setBrand(stepConfig.brand as BrandCode);
      navigate(stepConfig.route);
      setToastMessage(`Guided Demo: Step ${stepConfig.step}/8 — ${stepConfig.label}`);
    }
  };

  const handlePrevStep = () => {
    const prevStepNum = guidedStep <= 1 ? 8 : guidedStep - 1;
    setGuidedStep(prevStepNum);
    const stepConfig = heroSteps.find((s) => s.step === prevStepNum);
    if (stepConfig) {
      setPersona(stepConfig.persona as PersonaId);
      setMarket(stepConfig.market as MarketCode | 'ALL');
      setBrand(stepConfig.brand as BrandCode);
      navigate(stepConfig.route);
      setToastMessage(`Guided Demo: Step ${stepConfig.step}/8 — ${stepConfig.label}`);
    }
  };

  const handleResetDemo = () => {
    resetDemo();
    setToastMessage('Demo session state reset to initial seed data.');
  };

  return (
    <>
      <header className="h-14 bg-navy-900 text-white border-b border-navy-800 px-4 flex items-center justify-between z-30 select-none">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/cockpit')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-teal-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-2xs group-hover:bg-teal-500 transition">
              C
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white group-hover:text-teal-300 transition">
                Continuum
              </span>
              <span className="hidden xl:inline text-3xs text-slate-400 font-normal ml-2">
                Governed living segmentation
              </span>
            </div>
          </div>

          {/* Guided Demo Pill */}
          {guidedDemoActive && (
            <div className="hidden lg:flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-gold-500/20 border border-gold-500/40 rounded-full text-gold-300 text-2xs font-semibold">
              <Sparkles className="w-3 h-3 text-gold-400 animate-pulse" />
              <span>Step {guidedStep}/8</span>
              <button
                type="button"
                onClick={handlePrevStep}
                title="Previous step"
                className="ml-1 p-0.5 bg-navy-800 hover:bg-navy-700 text-gold-300 rounded text-3xs transition"
              >
                <ChevronLeft className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                title="Next step"
                className="px-1.5 py-0.2 bg-gold-500 text-navy-900 rounded text-3xs font-bold hover:bg-gold-400 transition flex items-center"
              >
                <span>Next</span>
                <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Center/Right Controls: Selectors & Persona Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Market Selector */}
          <div className="flex items-center gap-1">
            <span className="text-3xs uppercase font-semibold text-slate-400 hidden md:inline">
              Market:
            </span>
            <select
              value={currentMarket}
              onChange={(e) => setMarket(e.target.value as MarketCode | 'ALL')}
              disabled={currentPersona === 'P5'} // Local Agency locked to MKT_C
              className="bg-navy-800 text-slate-200 border border-navy-700 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60 cursor-pointer"
            >
              <option value="ALL">All Markets</option>
              <option value="MKT_A">Market A · Data-rich</option>
              <option value="MKT_B">Market B · Signal-enriched</option>
              <option value="MKT_C">Market C · Survey-led</option>
            </select>
          </div>

          {/* Brand Selector */}
          <div className="flex items-center gap-1">
            <span className="text-3xs uppercase font-semibold text-slate-400 hidden md:inline">
              Brand:
            </span>
            <select
              value={currentBrand}
              onChange={(e) => setBrand(e.target.value as BrandCode | 'ALL')}
              className="bg-navy-800 text-slate-200 border border-navy-700 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="AUR">Aurelix (Hero)</option>
              <option value="ZEN">Zentrova (Oncology)</option>
              <option value="CRD">Cardivance (Mature)</option>
              <option value="NEU">Neurelle (Neuro)</option>
              <option value="BRV">Brevanta (Resp)</option>
            </select>
          </div>

          {/* Persona Switcher */}
          <div className="flex items-center gap-1 bg-navy-800/80 border border-navy-700 rounded px-2 py-0.5">
            <User className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <select
              value={currentPersona}
              onChange={(e) => handlePersonaChange(e.target.value as PersonaId)}
              className="bg-transparent text-gold-300 font-semibold text-xs border-0 focus:outline-none cursor-pointer"
            >
              <option value="P1" className="bg-navy-900 text-white">
                P1 · Global Segmentation Lead
              </option>
              <option value="P2" className="bg-navy-900 text-white">
                P2 · Market Back Office
              </option>
              <option value="P3" className="bg-navy-900 text-white">
                P3 · KAM / Account Lead
              </option>
              <option value="P4" className="bg-navy-900 text-white">
                P4 · Field Rep (My Customers)
              </option>
              <option value="P5" className="bg-navy-900 text-white">
                P5 · Local Agency (Vendor)
              </option>
              <option value="P6" className="bg-navy-900 text-white">
                P6 · Executive / Compliance (Read-only)
              </option>
            </select>
          </div>

          {/* Utility Buttons: Guided Demo, Reset, Settings, About */}
          <div className="flex items-center gap-1 pl-1 border-l border-navy-800">
            {/* Guided Demo Toggle */}
            <button
              type="button"
              onClick={() => {
                const newActive = !guidedDemoActive;
                setGuidedDemoActive(newActive);
                if (newActive && guidedStep === 1) {
                  navigate('/cockpit');
                }
                setToastMessage(
                  newActive ? 'Guided Demo activated (Steps 1–8).' : 'Guided Demo deactivated.'
                );
              }}
              title="Toggle 8-step hero storyline walk-through"
              className={`p-1.5 rounded transition ${
                guidedDemoActive
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Play className="w-4 h-4" />
            </button>

            {/* Demo Reset */}
            <button
              type="button"
              onClick={handleResetDemo}
              title="Reset demo data to initial seed"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Settings Modal */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              title="AI Engine Configuration"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded transition"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* About Modal */}
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              title="About Continuum & Architecture"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded transition"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Guided Demo Presenter Banner per Phase C W2 */}
      {guidedDemoActive && (
        <div className="bg-amber-50/95 border-b border-gold-500/30 px-4 py-2 flex items-center justify-between text-xs text-navy-900 shadow-2xs z-20">
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-900 px-2 py-0.5 rounded bg-gold-500/25 border border-gold-500/40 text-2xs uppercase tracking-wide">
              Step {guidedStep}/8 · {currentStepConfig.label}
            </span>
            <span className="text-slate-700 italic hidden md:inline">
              &ldquo;{currentStepConfig.presenterNote}&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 mr-1">
              {currentStepConfig.subRoutes.map((sub, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => navigate(sub)}
                  className="text-2xs font-semibold px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition"
                  title={`Navigate to part ${sIdx + 1}`}
                >
                  Part {sIdx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={handlePrevStep}
              className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition"
              title="Previous Step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextStep}
              className="px-2.5 py-1 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded text-2xs shadow-2xs flex items-center gap-1 transition"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Ephemeral Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-20 z-50">
          <Toast
            toast={{
              id: 'topbar-toast',
              type: 'info',
              message: toastMessage,
            }}
            onDismiss={() => setToastMessage(null)}
          />
        </div>
      )}
    </>
  );
};

export default TopBar;
