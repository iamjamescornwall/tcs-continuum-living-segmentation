import governanceService from '../src/services/governanceService';
import { Proposal, SegmentHistory, ChangeEvent, Threshold } from '../src/types';

function runTests() {
  console.log('--- RUNNING GOVERNANCE SERVICE UNIT TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. canApprove Tests
  console.log('\n[Group 1: Approval Rights Matrix]');
  
  // Executive/Compliance is read-only
  const p6Check = governanceService.canApprove('P6', 'MKT_B', 'SEGMENT');
  assert(!p6Check.allowed && p6Check.reason?.includes('read-only'), 'P6 is strictly read-only');

  // Agency vendor cannot approve
  const p5Check = governanceService.canApprove('P5', 'MKT_C', 'SEGMENT');
  assert(!p5Check.allowed && p5Check.reason?.includes('Local agency vendors cannot approve'), 'P5 vendor cannot approve segments');

  // P2 can approve SEGMENT in Market B
  const p2Check = governanceService.canApprove('P2', 'MKT_B', 'SEGMENT');
  assert(p2Check.allowed, 'P2 Market Back Office can approve SEGMENT in MKT_B');

  // P4 Field Rep cannot approve strategic SEGMENT (owned by Back Office)
  const p4SegmentCheck = governanceService.canApprove('P4', 'MKT_B', 'SEGMENT');
  assert(!p4SegmentCheck.allowed && p4SegmentCheck.reason === 'Your role cannot approve this field in this market.', 'P4 cannot approve strategic SEGMENT (correct tooltip reason)');

  // P4 Field Rep CAN validate ADOPTION stage
  const p4AdoptionCheck = governanceService.canApprove('P4', 'MKT_B', 'ADOPTION');
  assert(p4AdoptionCheck.allowed, 'P4 Field Rep can validate ADOPTION stage');

  // 2. checkThresholds Tests
  console.log('\n[Group 2: Signal Thresholds]');
  const mockThreshold: Threshold = {
    market_code: 'MKT_B',
    dimension_code: 'SEGMENT',
    signal_type: 'Sales trend',
    threshold_value: '+10%',
    unit: '%',
    min_independent_signals: 2,
    min_confidence: 'Medium',
    lookback_days: 90,
  };

  const qualifiedEvent: ChangeEvent = {
    event_id: 'EVT-TEST-1',
    market_code: 'MKT_B',
    customer_type: 'HCP',
    customer_id: 'HCP-B-0001',
    brand_code: 'AUR',
    signal_type: 'Sales trend',
    source_category: 'Sales',
    detected_by: 'Agent',
    detected_at: '2026-10-10',
    magnitude: '+14%',
    direction: 'Up',
    description: 'TRx increased by 14%',
    data_age_days: 15,
    led_to_drift_flag: true,
  };

  const thresholdPassed = governanceService.checkThresholds(qualifiedEvent, mockThreshold);
  assert(thresholdPassed.qualifies && thresholdPassed.confidence === 'Medium', 'Signal magnitude (+14%) meets threshold (+10%)');

  const staleEvent: ChangeEvent = {
    ...qualifiedEvent,
    data_age_days: 120, // Exceeds lookback of 90d
  };
  const thresholdStale = governanceService.checkThresholds(staleEvent, mockThreshold);
  assert(!thresholdStale.qualifies, 'Stale event exceeding lookback days is disqualified');

  const weakEvent: ChangeEvent = {
    ...qualifiedEvent,
    magnitude: '+4%',
  };
  const thresholdWeak = governanceService.checkThresholds(weakEvent, mockThreshold);
  assert(!thresholdWeak.qualifies, 'Sub-threshold signal (+4% vs +10%) is disqualified');

  // 3. checkStability Tests
  console.log('\n[Group 3: Stability Policy Guardrails]');
  
  // Freeze window test (Market A active incentive freeze 2026-10-01 to 2026-10-31)
  const mktAProposal: Proposal = {
    proposal_id: 'PRP-TEST-FREEZE',
    market_code: 'MKT_A',
    customer_type: 'HCP',
    customer_id: 'HCP-A-0001',
    brand_code: 'AUR',
    indication_code: null,
    dimension_code: 'SEGMENT',
    current_value: 'Segment B',
    proposed_value: 'Segment A',
    segment_age_days: 100,
    confidence: 'High',
    drivers: [{ label: 'Sales surge', value: '+30%', source_category: 'Sales', data_age_days: 10 }],
    flag_ids: [],
    origin: 'Event-driven',
    origin_ref: null,
    approver_role: 'P2',
    approver_user_id: 'USR-P2',
    status: 'Proposed',
    hold_reason: null,
    policy_rule_ref: null,
    explanation_key: 'test',
    created_at: '2026-10-10',
    decided_at: null,
    decided_by: null,
    decision_reason: null,
  };

  const freezeResult = governanceService.checkStability(mktAProposal);
  assert(freezeResult.status === 'Hold' && freezeResult.rule === 'STAB-FREEZE', 'Active freeze window triggers STAB-FREEZE hold');

  // Conflicting signals test (Hero HCP-B-0007)
  const conflictingProposal: Proposal = {
    ...mktAProposal,
    market_code: 'MKT_B',
    customer_id: 'HCP-B-0007',
    hold_reason: 'Conflicting signals',
    drivers: [
      { label: 'Sales trend', value: '+20%', source_category: 'Sales', data_age_days: 5 },
      { label: 'Rep note contradiction', value: 'Rep stated temporary trial only', source_category: 'CRM', data_age_days: 2 },
    ],
  };

  const conflictResult = governanceService.checkStability(conflictingProposal);
  assert(conflictResult.status === 'Hold' && conflictResult.rule === 'STAB-CONFLICT', 'Conflicting signals trigger STAB-CONFLICT hold');

  // Change frequency limit test (max 2 changes per 180 days)
  const frequentHistory: SegmentHistory[] = [
    {
      history_id: 'HIS-1',
      customer_id: 'HCP-B-FREQ',
      customer_type: 'HCP',
      brand_code: 'AUR',
      dimension_code: 'SEGMENT',
      value: 'Segment C',
      valid_from: '2026-06-01',
      valid_to: '2026-08-01',
      change_reason: 'Approved proposal',
      approver_user_id: 'USR-P2',
    },
    {
      history_id: 'HIS-2',
      customer_id: 'HCP-B-FREQ',
      customer_type: 'HCP',
      brand_code: 'AUR',
      dimension_code: 'SEGMENT',
      value: 'Segment B',
      valid_from: '2026-08-01',
      valid_to: null,
      change_reason: 'Approved proposal',
      approver_user_id: 'USR-P2',
    },
  ];

  const frequentProposal: Proposal = {
    ...mktAProposal,
    market_code: 'MKT_B',
    customer_id: 'HCP-B-FREQ',
    drivers: [
      { label: 'Sales trend', value: '+18%', source_category: 'Sales', data_age_days: 5 },
      { label: 'Digital surge', value: '4 visits', source_category: 'Digital', data_age_days: 10 },
    ],
  };

  const freqResult = governanceService.checkStability(frequentProposal, frequentHistory);
  assert(freqResult.status === 'Hold' && freqResult.rule === 'STAB-FREQ', 'Exceeding 2 changes in 180 days triggers STAB-FREQ hold');

  // Allowed proposal test (Hero Dr. Vogel HCP-B-0001)
  const allowedProposal: Proposal = {
    ...mktAProposal,
    market_code: 'MKT_B',
    customer_id: 'HCP-B-0001',
    drivers: [
      { label: 'Sales trend', value: '+12% QoQ', source_category: 'Sales', data_age_days: 15 },
      { label: 'Digital activity', value: '6 visits/mo', source_category: 'Digital', data_age_days: 8 },
    ],
  };
  const allowedResult = governanceService.checkStability(allowedProposal, []);
  assert(allowedResult.status === 'Allowed', 'Valid proposal with no conflicts and outside freeze window is Allowed');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
