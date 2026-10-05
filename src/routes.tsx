import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { EmptyState } from './components/ui/EmptyState';

const S01_ExecutiveCockpit = lazy(() => import('./screens/S01_ExecutiveCockpit'));
const S02_ValueCalculator = lazy(() => import('./screens/S02_ValueCalculator'));
const S03_GlobalStandards = lazy(() => import('./screens/S03_GlobalStandards'));
const S04_MarketData = lazy(() => import('./screens/S04_MarketData'));
const S05_DataIntake = lazy(() => import('./screens/S05_DataIntake'));
const S06_SegmentationStudio = lazy(() => import('./screens/S06_SegmentationStudio'));
const S07_SegmentLibrary = lazy(() => import('./screens/S07_SegmentLibrary'));
const S08_SegmentInsights = lazy(() => import('./screens/S08_SegmentInsights'));
const S09_ChangeMonitor = lazy(() => import('./screens/S09_ChangeMonitor'));
const S10_ReviewQueue = lazy(() => import('./screens/S10_ReviewQueue'));
const S11_PublishToCrm = lazy(() => import('./screens/S11_PublishToCrm'));
const S12_SegmentHealth = lazy(() => import('./screens/S12_SegmentHealth'));
const S13_AuditAndLearning = lazy(() => import('./screens/S13_AuditAndLearning'));
const S14_ResponsibleAI = lazy(() => import('./screens/S14_ResponsibleAI'));
const D01_Customer360 = lazy(() => import('./screens/D01_Customer360'));
const S15_AskContinuum = lazy(() => import('./screens/S15_AskContinuum'));
const DevComponents = lazy(() => import('./screens/DevComponents'));

const PageLoader: React.FC = () => (
  <div className="p-12 flex items-center justify-center min-h-[60vh]">
    <EmptyState
      variant="loading"
      title="Loading Continuum Workspace..."
      description="Initializing governed dataset and analytical view."
    />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/cockpit" replace />} />
        <Route path="/cockpit" element={<S01_ExecutiveCockpit />} />
        <Route path="/value-calculator" element={<S02_ValueCalculator />} />
        <Route path="/standards" element={<S03_GlobalStandards />} />
        <Route path="/market-data" element={<S04_MarketData />} />
        <Route path="/intake" element={<S05_DataIntake />} />
        <Route path="/studio" element={<S06_SegmentationStudio />} />
        <Route path="/library" element={<S07_SegmentLibrary />} />
        <Route path="/insights" element={<S08_SegmentInsights />} />
        <Route path="/change-monitor" element={<S09_ChangeMonitor />} />
        <Route path="/review-queue" element={<S10_ReviewQueue />} />
        <Route path="/publish" element={<S11_PublishToCrm />} />
        <Route path="/health" element={<S12_SegmentHealth />} />
        <Route path="/audit" element={<S13_AuditAndLearning />} />
        <Route path="/responsible-ai" element={<S14_ResponsibleAI />} />
        <Route path="/customer/:type/:id" element={<D01_Customer360 />} />
        <Route path="/ask" element={<S15_AskContinuum />} />
        <Route path="/dev/components" element={<DevComponents />} />
        <Route path="*" element={<Navigate to="/cockpit" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
