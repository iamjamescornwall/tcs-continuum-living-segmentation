/**
 * Prompt 6: Change pipeline generator
 * Produces change_events.json, drift_flags.json, proposals.json
 */

import {
  ChangeEvent,
  DriftFlag,
  Proposal,
  HCP,
  Account,
  ProposalStatus,
  HoldReason,
  RejectionReason,
} from '../../src/types';
import {
  HERO_EVENTS_HCP_B0001,
  HERO_FLAGS_HCP_B0001,
  HERO_PROPOSALS_HCP_B0001,
} from '../heroes';
import { GeneratorContext, writeJsonFile } from '../utils';

export function generatePipelineData(
  ctx: GeneratorContext,
  hcps: HCP[],
  _accounts: Account[]
): {
  changeEvents: ChangeEvent[];
  driftFlags: DriftFlag[];
  proposals: Proposal[];
} {
  const changeEvents: ChangeEvent[] = [...HERO_EVENTS_HCP_B0001];
  const driftFlags: DriftFlag[] = [...HERO_FLAGS_HCP_B0001];
  const proposals: Proposal[] = [...HERO_PROPOSALS_HCP_B0001];

  let evtIdCounter = 5;
  let drfIdCounter = 6;
  let prpIdCounter = 6;

  // Hero account formulary event
  const heroFormularyEvent: ChangeEvent = {
    event_id: `EVT-${String(evtIdCounter++).padStart(6, '0')}`,
    market_code: 'MKT_B',
    customer_type: 'HCO',
    customer_id: 'ACC-B-001',
    brand_code: 'ZEN',
    signal_type: 'Formulary change',
    source_category: 'Claims & access',
    detected_by: 'Agent',
    detected_at: '2026-10-08T11:00:00Z',
    magnitude: 'Status: Under review → Listed',
    direction: 'Up',
    description: 'Regional hospital tender awarded Zentrova preferred formulary listing status.',
    data_age_days: 7,
    led_to_drift_flag: true,
  };
  changeEvents.push(heroFormularyEvent);

  // Hero Cardivance small change (led_to_drift_flag: false)
  changeEvents.push({
    event_id: `EVT-${String(evtIdCounter++).padStart(6, '0')}`,
    market_code: 'MKT_B',
    customer_type: 'HCP',
    customer_id: 'HCP-B-0010',
    brand_code: 'CRD',
    signal_type: 'Sales trend',
    source_category: 'Sales',
    detected_by: 'Agent',
    detected_at: '2026-10-05T09:30:00Z',
    magnitude: '+3% QoQ brick volume (BRK-B-020)',
    direction: 'Up',
    description: 'Sales movement observed (+3%) is below the ±10% MKT_B drift threshold.',
    data_age_days: 10,
    led_to_drift_flag: false, // Does NOT lead to drift flag!
  });

  // Account proposals for ACC-B-001
  const flagAccStatus: DriftFlag = {
    flag_id: `DRF-${String(drfIdCounter++).padStart(6, '0')}`,
    market_code: 'MKT_B',
    customer_type: 'HCO',
    customer_id: 'ACC-B-001',
    brand_code: 'ZEN',
    dimension_code: 'ACCESS_STATUS',
    current_value: 'Under review',
    indicated_value: 'Listed',
    drift_score: 0.98,
    confidence: 'High',
    threshold_ref: 'THR-B-ACC-01',
    supporting_event_ids: [heroFormularyEvent.event_id],
    independent_signal_count: 1,
    model_version: 'v2.4-drift-classifier',
    flagged_at: '2026-10-08T11:30:00Z',
  };
  const flagAccTier: DriftFlag = {
    flag_id: `DRF-${String(drfIdCounter++).padStart(6, '0')}`,
    market_code: 'MKT_B',
    customer_type: 'HCO',
    customer_id: 'ACC-B-001',
    brand_code: 'ZEN',
    dimension_code: 'ACC_TIER',
    current_value: 'Tier 2',
    indicated_value: 'Tier 1',
    drift_score: 0.92,
    confidence: 'High',
    threshold_ref: 'THR-B-TIER-01',
    supporting_event_ids: [heroFormularyEvent.event_id],
    independent_signal_count: 1,
    model_version: 'v2.4-drift-classifier',
    flagged_at: '2026-10-08T11:35:00Z',
  };
  driftFlags.push(flagAccStatus, flagAccTier);

  proposals.push(
    {
      proposal_id: `PRP-${String(prpIdCounter++).padStart(6, '0')}`,
      market_code: 'MKT_B',
      customer_type: 'HCO',
      customer_id: 'ACC-B-001',
      brand_code: 'ZEN',
      indication_code: null,
      dimension_code: 'ACCESS_STATUS',
      current_value: 'Under review',
      proposed_value: 'Listed',
      segment_age_days: 7,
      confidence: 'High',
      drivers: [
        { label: 'Tender award notification', value: 'Unrestricted listing', source_category: 'Claims & access', data_age_days: 7 },
      ],
      flag_ids: [flagAccStatus.flag_id],
      origin: 'Event-driven',
      origin_ref: heroFormularyEvent.event_id,
      approver_role: 'P3',
      approver_user_id: 'USR-005',
      status: 'Proposed',
      hold_reason: null,
      policy_rule_ref: null,
      explanation_key: 'PRP-000006',
      created_at: '2026-10-08T12:00:00Z',
      decided_at: null,
      decided_by: null,
      decision_reason: null,
    },
    {
      proposal_id: `PRP-${String(prpIdCounter++).padStart(6, '0')}`,
      market_code: 'MKT_B',
      customer_type: 'HCO',
      customer_id: 'ACC-B-001',
      brand_code: 'ZEN',
      indication_code: null,
      dimension_code: 'ACC_TIER',
      current_value: 'Tier 2',
      proposed_value: 'Tier 1',
      segment_age_days: 7,
      confidence: 'High',
      drivers: [
        { label: 'Formulary status update', value: 'Now Listed in oncology', source_category: 'Claims & access', data_age_days: 7 },
        { label: 'Annual oncology patient volume', value: '860 patients/yr', source_category: 'Reference', data_age_days: 30 },
      ],
      flag_ids: [flagAccTier.flag_id],
      origin: 'Event-driven',
      origin_ref: heroFormularyEvent.event_id,
      approver_role: 'P3',
      approver_user_id: 'USR-005',
      status: 'Proposed',
      hold_reason: null,
      policy_rule_ref: null,
      explanation_key: 'PRP-000007',
      created_at: '2026-10-08T12:05:00Z',
      decided_at: null,
      decided_by: null,
      decision_reason: null,
    }
  );

  // Propagation proposals for HCP-B-0002 … HCP-B-0006
  const oncoPropagation = [
    { id: 'HCP-B-0002', curr: 'B', prop: 'A', conf: 'High' as const, status: 'Proposed' as ProposalStatus, hold: null, rule: null },
    { id: 'HCP-B-0003', curr: 'B', prop: 'A', conf: 'High' as const, status: 'Proposed' as ProposalStatus, hold: null, rule: null },
    { id: 'HCP-B-0004', curr: 'C', prop: 'B', conf: 'High' as const, status: 'Proposed' as ProposalStatus, hold: null, rule: null },
    { id: 'HCP-B-0005', curr: 'C', prop: 'B', conf: 'Medium' as const, status: 'Proposed' as ProposalStatus, hold: null, rule: null },
    {
      id: 'HCP-B-0006',
      curr: 'C',
      prop: 'B',
      conf: 'Medium' as const,
      status: 'Held' as ProposalStatus,
      hold: 'Conflicting signals' as HoldReason,
      rule: 'POL-B-CONFLICT-01',
    },
  ];

  oncoPropagation.forEach((op) => {
    const flagId = `DRF-${String(drfIdCounter++).padStart(6, '0')}`;
    driftFlags.push({
      flag_id: flagId,
      market_code: 'MKT_B',
      customer_type: 'HCP',
      customer_id: op.id,
      brand_code: 'ZEN',
      dimension_code: 'SEGMENT',
      current_value: op.curr,
      indicated_value: op.prop,
      drift_score: op.conf === 'High' ? 0.88 : 0.72,
      confidence: op.conf,
      threshold_ref: 'THR-B-PROPAGATION-01',
      supporting_event_ids: [heroFormularyEvent.event_id],
      independent_signal_count: op.hold ? 2 : 1,
      model_version: 'v2.4-drift-classifier',
      flagged_at: '2026-10-09T08:30:00Z',
    });

    const drivers = [
      {
        label: 'Account formulary win (ACC-B-001)',
        value: 'Zentrova listed on formulary',
        source_category: 'Claims & access',
        data_age_days: 7,
      },
      {
        label: 'Accessible prescribing potential rise',
        value: 'Potential up one level (2 → 3)',
        source_category: 'Reference',
        data_age_days: 7,
      },
    ];

    if (op.hold) {
      drivers.push({
        label: 'Declining call acceptance',
        value: '3 consecutive call declines logged',
        source_category: 'CRM',
        data_age_days: 4,
      });
    }

    const prpKey = `PRP-${String(prpIdCounter).padStart(6, '0')}`;
    proposals.push({
      proposal_id: `PRP-${String(prpIdCounter++).padStart(6, '0')}`,
      market_code: 'MKT_B',
      customer_type: 'HCP',
      customer_id: op.id,
      brand_code: 'ZEN',
      indication_code: 'ZEN_NSCLC',
      dimension_code: 'SEGMENT',
      current_value: op.curr,
      proposed_value: op.prop,
      segment_age_days: 120,
      confidence: op.conf,
      drivers,
      flag_ids: [flagId],
      origin: 'Propagation',
      origin_ref: heroFormularyEvent.event_id,
      approver_role: 'P2',
      approver_user_id: 'USR-002',
      status: op.status,
      hold_reason: op.hold,
      policy_rule_ref: op.rule,
      explanation_key: prpKey,
      created_at: '2026-10-09T09:00:00Z',
      decided_at: null,
      decided_by: null,
      decision_reason: null,
    });
  });

  // Supporting hero proposals:
  // HCP-B-0007: Aurelix Held (Conflicting signals)
  const flagB0007 = `DRF-${String(drfIdCounter++).padStart(6, '0')}`;
  driftFlags.push({
    flag_id: flagB0007,
    market_code: 'MKT_B',
    customer_type: 'HCP',
    customer_id: 'HCP-B-0007',
    brand_code: 'AUR',
    dimension_code: 'SEGMENT',
    current_value: 'C',
    indicated_value: 'B',
    drift_score: 0.74,
    confidence: 'Medium',
    threshold_ref: 'THR-B-SEG-01',
    supporting_event_ids: [],
    independent_signal_count: 2,
    model_version: 'v2.4-drift-classifier',
    flagged_at: '2026-10-10T10:00:00Z',
  });
  proposals.push({
    proposal_id: `PRP-${String(prpIdCounter++).padStart(6, '0')}`,
    market_code: 'MKT_B',
    customer_type: 'HCP',
    customer_id: 'HCP-B-0007',
    brand_code: 'AUR',
    indication_code: 'AUR_PSO',
    dimension_code: 'SEGMENT',
    current_value: 'C',
    proposed_value: 'B',
    segment_age_days: 145,
    confidence: 'Medium',
    drivers: [
      { label: 'Brick sales volume uptick', value: '+14% QoQ', source_category: 'Sales', data_age_days: 12 },
      { label: 'Rep note contradicts signal', value: 'Trial driven by samples; unlikely to continue', source_category: 'CRM', data_age_days: 6 },
    ],
    flag_ids: [flagB0007],
    origin: 'Event-driven',
    origin_ref: null,
    approver_role: 'P2',
    approver_user_id: 'USR-002',
    status: 'Held',
    hold_reason: 'Conflicting signals',
    policy_rule_ref: 'POL-B-CONFLICT-01',
    explanation_key: 'PRP-000013',
    created_at: '2026-10-10T10:15:00Z',
    decided_at: null,
    decided_by: null,
    decision_reason: null,
  });

  // HCP-A-0001: Aurelix Held (Freeze window)
  const flagA0001 = `DRF-${String(drfIdCounter++).padStart(6, '0')}`;
  driftFlags.push({
    flag_id: flagA0001,
    market_code: 'MKT_A',
    customer_type: 'HCP',
    customer_id: 'HCP-A-0001',
    brand_code: 'AUR',
    dimension_code: 'SEGMENT',
    current_value: 'B',
    indicated_value: 'A',
    drift_score: 0.89,
    confidence: 'High',
    threshold_ref: 'THR-A-SEG-01',
    supporting_event_ids: [],
    independent_signal_count: 2,
    model_version: 'v2.4-drift-classifier',
    flagged_at: '2026-10-04T09:00:00Z',
  });
  proposals.push({
    proposal_id: `PRP-${String(prpIdCounter++).padStart(6, '0')}`,
    market_code: 'MKT_A',
    customer_type: 'HCP',
    customer_id: 'HCP-A-0001',
    brand_code: 'AUR',
    indication_code: 'AUR_PSO',
    dimension_code: 'SEGMENT',
    current_value: 'B',
    proposed_value: 'A',
    segment_age_days: 95,
    confidence: 'High',
    drivers: [
      { label: 'HCP TRx volume growth', value: '+19% QoQ', source_category: 'Sales', data_age_days: 15 },
      { label: 'Portal visit frequency', value: '7 visits/mo', source_category: 'Digital', data_age_days: 8 },
    ],
    flag_ids: [flagA0001],
    origin: 'Event-driven',
    origin_ref: null,
    approver_role: 'P2',
    approver_user_id: 'USR-003',
    status: 'Held',
    hold_reason: 'Freeze window',
    policy_rule_ref: 'POL-A-FREEZE-Q4',
    explanation_key: 'PRP-000014',
    created_at: '2026-10-04T09:15:00Z',
    decided_at: null,
    decided_by: null,
    decision_reason: null,
  });

  // HCP-A-0002: Previously Rejected (Temporary behaviour)
  const flagA0002 = `DRF-${String(drfIdCounter++).padStart(6, '0')}`;
  driftFlags.push({
    flag_id: flagA0002,
    market_code: 'MKT_A',
    customer_type: 'HCP',
    customer_id: 'HCP-A-0002',
    brand_code: 'AUR',
    dimension_code: 'SEGMENT',
    current_value: 'C',
    indicated_value: 'B',
    drift_score: 0.76,
    confidence: 'Medium',
    threshold_ref: 'THR-A-SEG-01',
    supporting_event_ids: [],
    independent_signal_count: 2,
    model_version: 'v2.4-drift-classifier',
    flagged_at: '2026-09-12T14:00:00Z',
  });
  proposals.push({
    proposal_id: `PRP-${String(prpIdCounter++).padStart(6, '0')}`,
    market_code: 'MKT_A',
    customer_type: 'HCP',
    customer_id: 'HCP-A-0002',
    brand_code: 'AUR',
    indication_code: 'AUR_PSO',
    dimension_code: 'SEGMENT',
    current_value: 'C',
    proposed_value: 'B',
    segment_age_days: 80,
    confidence: 'Medium',
    drivers: [
      { label: 'One-time prescription spike', value: '+22% 30d', source_category: 'Sales', data_age_days: 35 },
    ],
    flag_ids: [flagA0002],
    origin: 'Event-driven',
    origin_ref: null,
    approver_role: 'P2',
    approver_user_id: 'USR-003',
    status: 'Rejected',
    hold_reason: null,
    policy_rule_ref: null,
    explanation_key: 'PRP-000015',
    created_at: '2026-09-12T14:15:00Z',
    decided_at: '2026-09-15T11:00:00Z',
    decided_by: 'USR-003',
    decision_reason: 'Temporary behaviour',
  });

  // HCP-C-0001: Market C rep observation loop
  const flagC0001 = `DRF-${String(drfIdCounter++).padStart(6, '0')}`;
  driftFlags.push({
    flag_id: flagC0001,
    market_code: 'MKT_C',
    customer_type: 'HCP',
    customer_id: 'HCP-C-0001',
    brand_code: 'AUR',
    dimension_code: 'ADOPTION',
    current_value: 'Consideration',
    indicated_value: 'Trial',
    drift_score: 0.79,
    confidence: 'Medium',
    threshold_ref: 'THR-C-ADP-01',
    supporting_event_ids: [],
    independent_signal_count: 2,
    model_version: 'v2.4-drift-classifier',
    flagged_at: '2026-10-06T10:00:00Z',
  });
  proposals.push({
    proposal_id: `PRP-${String(prpIdCounter++).padStart(6, '0')}`,
    market_code: 'MKT_C',
    customer_type: 'HCP',
    customer_id: 'HCP-C-0001',
    brand_code: 'AUR',
    indication_code: 'AUR_PSO',
    dimension_code: 'ADOPTION',
    current_value: 'Consideration',
    proposed_value: 'Trial',
    segment_age_days: 122,
    confidence: 'Medium',
    drivers: [
      { label: 'Structured rep assessment', value: 'First biologic patient initiated', source_category: 'CRM', data_age_days: 9 },
      { label: 'PMR Wave survey response', value: 'High intent to prescribe in Q4', source_category: 'Survey', data_age_days: 20 },
    ],
    flag_ids: [flagC0001],
    origin: 'Event-driven',
    origin_ref: null,
    approver_role: 'P4',
    approver_user_id: 'USR-029',
    status: 'Proposed',
    hold_reason: null,
    policy_rule_ref: null,
    explanation_key: 'PRP-000016',
    created_at: '2026-10-06T10:30:00Z',
    decided_at: null,
    decided_by: null,
    decision_reason: null,
  });

  // Generate remainder of change_events, drift_flags, proposals
  // Target total change_events ~750 (≈380 A, 260 B, 110 C)
  // Target total drift_flags ~220 (≈110 A, 75 B, 35 C)
  // Target total proposals ~145 (≈70 A, 50 B, 25 C)
  const remainingA = { events: 380 - changeEvents.filter(e => e.market_code === 'MKT_A').length, flags: 110 - driftFlags.filter(f => f.market_code === 'MKT_A').length, props: 70 - proposals.filter(p => p.market_code === 'MKT_A').length };
  const remainingB = { events: 260 - changeEvents.filter(e => e.market_code === 'MKT_B').length, flags: 75 - driftFlags.filter(f => f.market_code === 'MKT_B').length, props: 50 - proposals.filter(p => p.market_code === 'MKT_B').length };
  const remainingC = { events: 110 - changeEvents.filter(e => e.market_code === 'MKT_C').length, flags: 35 - driftFlags.filter(f => f.market_code === 'MKT_C').length, props: 25 - proposals.filter(p => p.market_code === 'MKT_C').length };

  const marketsData = [
    { code: 'MKT_A' as const, remaining: remainingA, hcps: hcps.filter(h => h.market_code === 'MKT_A'), p2User: 'USR-003', p4User: 'USR-010' },
    { code: 'MKT_B' as const, remaining: remainingB, hcps: hcps.filter(h => h.market_code === 'MKT_B'), p2User: 'USR-002', p4User: 'USR-006' },
    { code: 'MKT_C' as const, remaining: remainingC, hcps: hcps.filter(h => h.market_code === 'MKT_C'), p2User: 'USR-004', p4User: 'USR-029' },
  ];

  for (const m of marketsData) {
    // Generate events
    for (let i = 0; i < m.remaining.events; i++) {
      const hcp = ctx.choice(m.hcps);
      const isDrift = i < m.remaining.flags;
      const bList = m.code === 'MKT_C' ? ['AUR', 'ZEN', 'CRD'] : ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'];
      const brand = ctx.choice(bList) as any;

      const sigTypes: Array<any> =
        m.code === 'MKT_A'
          ? ['Rx trend', 'Digital engagement', 'PMR wave', 'CRM activity']
          : m.code === 'MKT_B'
          ? ['Sales trend', 'Digital engagement', 'PMR wave', 'CRM activity', 'Rep note']
          : ['PMR wave', 'CRM activity', 'Rep note'];

      const st = ctx.choice(sigTypes);
      const source = st === 'Rx trend' || st === 'Sales trend' ? 'Sales' : (st === 'Digital engagement' ? 'Digital' : (st === 'PMR wave' ? 'Survey' : 'CRM'));

      changeEvents.push({
        event_id: `EVT-${String(evtIdCounter++).padStart(6, '0')}`,
        market_code: m.code,
        customer_type: 'HCP',
        customer_id: hcp.hcp_id,
        brand_code: brand,
        signal_type: st,
        source_category: source,
        detected_by: st === 'Rep note' ? 'GenAI' : 'Agent',
        detected_at: '2026-09-28T09:00:00Z',
        magnitude: '+15% trajectory change',
        direction: ctx.choice(['Up', 'Down']),
        description: `Signal movement detected in ${st} for ${hcp.display_name}.`,
        data_age_days: ctx.randomInt(5, 30),
        led_to_drift_flag: isDrift,
      });
    }

    // Generate flags
    const flagIdsForMarket: string[] = [];
    for (let i = 0; i < m.remaining.flags; i++) {
      const hcp = ctx.choice(m.hcps);
      const bList = m.code === 'MKT_C' ? ['AUR', 'ZEN', 'CRD'] : ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'];
      const brand = ctx.choice(bList) as any;
      const dim = ctx.choice(['SEGMENT', 'ADOPTION', 'DIGITAL', 'POTENTIAL']) as any;
      const fid = `DRF-${String(drfIdCounter++).padStart(6, '0')}`;
      flagIdsForMarket.push(fid);

      driftFlags.push({
        flag_id: fid,
        market_code: m.code,
        customer_type: 'HCP',
        customer_id: hcp.hcp_id,
        brand_code: brand,
        dimension_code: dim,
        current_value: 'C',
        indicated_value: 'B',
        drift_score: ctx.round(ctx.randomFloat(0.70, 0.95), 2),
        confidence: ctx.choice(['High', 'Medium']),
        threshold_ref: `THR-${m.code}-01`,
        supporting_event_ids: [],
        independent_signal_count: ctx.randomInt(1, 3),
        model_version: 'v2.4-drift-classifier',
        flagged_at: '2026-10-02T10:00:00Z',
      });
    }

    // Generate proposals
    // Status mix: Proposed 45%, Held 15%, Approved 15%, Rejected 10%, Written back 15%
    for (let i = 0; i < m.remaining.props; i++) {
      const hcp = ctx.choice(m.hcps);
      const bList = m.code === 'MKT_C' ? ['AUR', 'ZEN', 'CRD'] : ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'];
      const brand = ctx.choice(bList) as any;
      const dim = ctx.choice(['SEGMENT', 'ADOPTION', 'DIGITAL']) as any;
      const conf = ctx.choice(['High', 'Medium', 'Low']) as any;

      const status: ProposalStatus = ctx.weightedChoice(
        ['Proposed', 'Held', 'Approved', 'Rejected', 'Written back'],
        [0.45, 0.15, 0.15, 0.10, 0.15]
      );

      let holdReason: HoldReason | null = null;
      let policyRuleRef: string | null = null;
      if (status === 'Held') {
        holdReason = ctx.choice([
          'Conflicting signals',
          'Freeze window',
          'Change-frequency limit',
          'Insufficient evidence',
        ]);
        policyRuleRef = `POL-${m.code}-RULE-01`;
      }

      let decisionReason: RejectionReason | string | null = null;
      let decidedAt: string | null = null;
      let decidedBy: string | null = null;

      if (status === 'Rejected') {
        decisionReason = ctx.choice([
          'Field knowledge contradicts signal',
          'Temporary behaviour',
          'Data quality issue',
          'Freeze period',
          'Other',
        ]);
        decidedAt = '2026-10-08T14:00:00Z';
        decidedBy = m.p2User;
      } else if (status === 'Approved' || status === 'Written back') {
        decidedAt = '2026-10-09T16:00:00Z';
        decidedBy = dim === 'ADOPTION' || dim === 'DIGITAL' ? m.p4User : m.p2User;
        decisionReason = 'Approved after evidence review';
      }

      const pId = `PRP-${String(prpIdCounter++).padStart(6, '0')}`;

      proposals.push({
        proposal_id: pId,
        market_code: m.code,
        customer_type: 'HCP',
        customer_id: hcp.hcp_id,
        brand_code: brand,
        indication_code: brand === 'AUR' ? 'AUR_PSO' : null,
        dimension_code: dim,
        current_value: 'C',
        proposed_value: 'B',
        segment_age_days: ctx.randomInt(70, 240),
        confidence: conf,
        drivers: [
          {
            label: 'Signal indicator change',
            value: '+15% relative velocity',
            source_category: 'Sales',
            data_age_days: ctx.randomInt(5, 25),
          },
        ],
        flag_ids: [ctx.choice(flagIdsForMarket) || 'DRF-000001'],
        origin: 'Event-driven',
        origin_ref: null,
        approver_role: dim === 'ADOPTION' || dim === 'DIGITAL' ? 'P4' : 'P2',
        approver_user_id: dim === 'ADOPTION' || dim === 'DIGITAL' ? m.p4User : m.p2User,
        status,
        hold_reason: holdReason,
        policy_rule_ref: policyRuleRef,
        explanation_key: pId,
        created_at: '2026-10-04T08:00:00Z',
        decided_at: decidedAt,
        decided_by: decidedBy,
        decision_reason: decisionReason,
      });
    }
  }

  writeJsonFile('change_events.json', changeEvents);
  writeJsonFile('drift_flags.json', driftFlags);
  writeJsonFile('proposals.json', proposals);

  return { changeEvents, driftFlags, proposals };
}
