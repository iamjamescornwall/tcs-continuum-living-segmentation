import governanceService from '../src/services/governanceService';
import dataService from '../src/services/dataService';
import { PersonaId, MarketCode, DimensionCode } from '../src/types';

interface PersonaSpec {
  id: PersonaId;
  name: string;
  expectedLanding: string;
  expectedMarketScope: string;
  canApproveStrategicSegment: boolean;
  canValidateAdoption: boolean;
  isReadOnly: boolean;
}

const personaSpecs: PersonaSpec[] = [
  {
    id: 'P1',
    name: 'Global Segmentation Lead',
    expectedLanding: '/standards',
    expectedMarketScope: 'ALL',
    canApproveStrategicSegment: true,
    canValidateAdoption: true,
    isReadOnly: false,
  },
  {
    id: 'P2',
    name: 'Market Back Office (Comm Excellence)',
    expectedLanding: '/review-queue',
    expectedMarketScope: 'MKT_B',
    canApproveStrategicSegment: true,
    canValidateAdoption: false,
    isReadOnly: false,
  },
  {
    id: 'P3',
    name: 'KAM / Account Lead',
    expectedLanding: '/review-queue',
    expectedMarketScope: 'MKT_B',
    canApproveStrategicSegment: false, // only account dimensions
    canValidateAdoption: false,
    isReadOnly: false,
  },
  {
    id: 'P4',
    name: 'Field Rep (My Customers)',
    expectedLanding: '/review-queue',
    expectedMarketScope: 'MKT_B',
    canApproveStrategicSegment: false, // tooltips "Your role cannot approve this field in this market."
    canValidateAdoption: true,
    isReadOnly: false,
  },
  {
    id: 'P5',
    name: 'Local Agency (Vendor)',
    expectedLanding: '/intake',
    expectedMarketScope: 'MKT_C',
    canApproveStrategicSegment: false,
    canValidateAdoption: false,
    isReadOnly: false,
  },
  {
    id: 'P6',
    name: 'Executive / Compliance',
    expectedLanding: '/cockpit',
    expectedMarketScope: 'ALL',
    canApproveStrategicSegment: false,
    canValidateAdoption: false,
    isReadOnly: true,
  },
];

function runPersonaMatrixTests() {
  console.log('==================================================');
  console.log('PERSONA QA VERIFICATION MATRIX (Phase C - W3)');
  console.log('==================================================\n');

  const matrixResults: Record<string, Record<string, string>> = {};
  let allPass = true;

  personaSpecs.forEach((spec) => {
    matrixResults[spec.id] = {};

    // 1. Check Strategic Segment Approval (MKT_B)
    const segCheck = governanceService.canApprove(spec.id, 'MKT_B', 'SEGMENT');
    const segPass = spec.canApproveStrategicSegment === segCheck.allowed;
    matrixResults[spec.id]['Approve SEGMENT'] = segPass ? '✅ PASS' : '❌ FAIL';
    if (!segPass) allPass = false;

    // 2. Check Adoption Stage Validation (MKT_B)
    const adoptCheck = governanceService.canApprove(spec.id, 'MKT_B', 'ADOPTION');
    const adoptPass = spec.canValidateAdoption === adoptCheck.allowed;
    matrixResults[spec.id]['Validate ADOPTION'] = adoptPass ? '✅ PASS' : '❌ FAIL';
    if (!adoptPass) allPass = false;

    // 3. Check Read-Only for P6 or Disabled Tooltip Reason
    if (spec.id === 'P6') {
      const p6Readonly = !segCheck.allowed && segCheck.reason?.includes('read-only');
      matrixResults[spec.id]['Read-Only Enforced'] = p6Readonly ? '✅ PASS' : '❌ FAIL';
      if (!p6Readonly) allPass = false;
    } else if (!spec.canApproveStrategicSegment) {
      const tooltipCorrect = segCheck.reason === 'Your role cannot approve this field in this market.' || segCheck.reason?.includes('vendor');
      matrixResults[spec.id]['Correct Tooltip'] = tooltipCorrect ? '✅ PASS' : '❌ FAIL';
      if (!tooltipCorrect) allPass = false;
    } else {
      matrixResults[spec.id]['Correct Tooltip'] = 'N/A (Can act)';
    }
  });

  console.table(matrixResults);

  if (allPass) {
    console.log('\n🎉 ALL PERSONA QA CHECKS PASSED PERFECTLY!\n');
  } else {
    console.error('\n❌ SOME PERSONA QA CHECKS FAILED!\n');
    process.exit(1);
  }
}

runPersonaMatrixTests();
