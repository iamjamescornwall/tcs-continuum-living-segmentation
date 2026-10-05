import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import S01_ExecutiveCockpit from './screens/S01_ExecutiveCockpit';
import S02_ValueCalculator from './screens/S02_ValueCalculator';
import S03_GlobalStandards from './screens/S03_GlobalStandards';
import S04_MarketData from './screens/S04_MarketData';
import S05_DataIntake from './screens/S05_DataIntake';
import S06_SegmentationStudio from './screens/S06_SegmentationStudio';
import S07_SegmentLibrary from './screens/S07_SegmentLibrary';
import S08_SegmentInsights from './screens/S08_SegmentInsights';
import S09_ChangeMonitor from './screens/S09_ChangeMonitor';
import S10_ReviewQueue from './screens/S10_ReviewQueue';
import S11_PublishToCrm from './screens/S11_PublishToCrm';
import S12_SegmentHealth from './screens/S12_SegmentHealth';
import S13_AuditAndLearning from './screens/S13_AuditAndLearning';
import S14_ResponsibleAI from './screens/S14_ResponsibleAI';
import D01_Customer360 from './screens/D01_Customer360';
import S15_AskContinuum from './screens/S15_AskContinuum';
import DevComponents from './screens/DevComponents';

export const AppRoutes: React.FC = () => {
  return (
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
  );
};

export default AppRoutes;
