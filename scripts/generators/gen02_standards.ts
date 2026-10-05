/**
 * Prompt 2: Standards and governance generator
 * Produces dimensions.json, approval_rights.json, thresholds.json,
 * stability_policy.json, vocabulary_map.json
 */

import {
  Dimension,
  ApprovalRight,
  Threshold,
  StabilityPolicy,
  VocabularyMapEntry,
  MarketCode,
} from '../../src/types';
import { writeJsonFile } from '../utils';

export function generateStandardsData(): {
  dimensions: Dimension[];
  approvalRights: ApprovalRight[];
  thresholds: Threshold[];
  stabilityPolicy: StabilityPolicy;
  vocabularyMap: VocabularyMapEntry[];
} {
  const dimensions: Dimension[] = [
    {
      dimension_code: 'SEGMENT',
      customer_type: 'HCP',
      name: 'HCP Value Segment',
      captured_per: 'brand',
      allowed_values: ['A', 'B', 'C', 'D', 'E'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['thresholds', 'cadence'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'POTENTIAL',
      customer_type: 'HCP',
      name: 'Prescribing Potential',
      captured_per: 'brand',
      allowed_values: ['1', '2', '3', '4'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['weights', 'thresholds'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'ADOPTION',
      customer_type: 'HCP',
      name: 'Brand Adoption Stage',
      captured_per: 'brand',
      allowed_values: ['Unaware', 'Aware', 'Consideration', 'Trial', 'Adoption', 'Expansion'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['thresholds', 'cadence'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'BEHAVIOURAL',
      customer_type: 'HCP',
      name: 'Behavioural Segment',
      captured_per: 'brand',
      allowed_values: ['Traditionalist', 'Pragmatist', 'Engaged', 'Advocate'],
      layer: 'Strategic',
      refreshable_between_cycles: false,
      global_fixed: true,
      market_configurable: ['cluster_naming'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'ATTITUDINAL',
      customer_type: 'HCP',
      name: 'Attitudinal Archetype',
      captured_per: 'brand',
      allowed_values: ['Early adopter', 'Early majority', 'Late majority', 'Sceptic'],
      layer: 'Strategic',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['survey_wave_mapping'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'DIGITAL',
      customer_type: 'HCP',
      name: 'Digital Affinity',
      captured_per: 'customer',
      allowed_values: ['Traditional', 'Evolving', 'Savvy'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['thresholds'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'CHANNEL_PREF',
      customer_type: 'HCP',
      name: 'Channel Preference',
      captured_per: 'customer',
      allowed_values: ['Face-to-face', 'Remote', 'Email', 'Portal', 'Events', 'Mixed'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['cadence'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'MICRO_SEGMENT',
      customer_type: 'HCP',
      name: 'Micro-segment Cell',
      captured_per: 'brand_market',
      allowed_values: ['MS-01', 'MS-02', 'MS-03', 'MS-04', 'MS-05', 'MS-06', 'MS-07', 'MS-08', 'None'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: false,
      market_configurable: ['micro_segment_scheme'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'ACC_ARCHETYPE',
      customer_type: 'HCO',
      name: 'Account Archetype',
      captured_per: 'customer',
      allowed_values: [
        'Academic centre',
        'Community hospital',
        'Specialty clinic',
        'Integrated network',
        'Private practice group',
        'Pharmacy chain',
      ],
      layer: 'Strategic',
      refreshable_between_cycles: false,
      global_fixed: true,
      market_configurable: [],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'ACC_POTENTIAL',
      customer_type: 'HCO',
      name: 'Account Potential Tier',
      captured_per: 'brand',
      allowed_values: ['1', '2', '3', '4'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['thresholds'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'ACCESS_STATUS',
      customer_type: 'HCO',
      name: 'Formulary & Access Status',
      captured_per: 'brand',
      allowed_values: ['Listed', 'Restricted', 'Under review', 'Not listed'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['tender_cadence'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'DECISION_MODEL',
      customer_type: 'HCO',
      name: 'Decision-Making Model',
      captured_per: 'customer',
      allowed_values: ['Clinician-led', 'Committee-led', 'Protocol-driven', 'Procurement-led'],
      layer: 'Strategic',
      refreshable_between_cycles: false,
      global_fixed: true,
      market_configurable: [],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'TREATMENT_CAP',
      customer_type: 'HCO',
      name: 'Treatment Capability',
      captured_per: 'customer',
      allowed_values: ['Full (infusion + specialist)', 'Partial', 'Referral only'],
      layer: 'Strategic',
      refreshable_between_cycles: false,
      global_fixed: true,
      market_configurable: [],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
    {
      dimension_code: 'ACC_TIER',
      customer_type: 'HCO',
      name: 'Account Priority Tier',
      captured_per: 'brand',
      allowed_values: ['Tier 1', 'Tier 2', 'Tier 3'],
      layer: 'Priority',
      refreshable_between_cycles: true,
      global_fixed: true,
      market_configurable: ['thresholds'],
      version: 'v3.2',
      effective_from: '2026-01-01',
    },
  ];

  const markets: MarketCode[] = ['MKT_A', 'MKT_B', 'MKT_C'];
  const approvalRights: ApprovalRight[] = [];

  for (const market of markets) {
    for (const dim of dimensions) {
      let approver: 'P1' | 'P2' | 'P3' | 'P4' = 'P2';
      let coApprover: 'P1' | 'P2' | 'P3' | 'P4' | null = null;
      let aiRole: 'Propose' | 'Detect drift' | 'Infer and suggest' | 'Refresh between waves' | 'Flag for review' = 'Propose';
      let never = 'overwrite without human sign-off';

      if (['SEGMENT', 'MICRO_SEGMENT'].includes(dim.dimension_code)) {
        approver = 'P2';
        aiRole = 'Propose';
        never = 'overwrite';
      } else if (dim.dimension_code === 'POTENTIAL') {
        if (market === 'MKT_C') {
          approver = 'P4';
          coApprover = 'P2';
          aiRole = 'Propose';
          never = 'overwrite';
        } else {
          approver = 'P2';
          aiRole = 'Propose';
          never = 'overwrite';
        }
      } else if (dim.dimension_code === 'BEHAVIOURAL') {
        approver = 'P2';
        aiRole = 'Flag for review';
        never = 'change between cycles';
      } else if (dim.dimension_code === 'ATTITUDINAL') {
        approver = 'P2';
        aiRole = 'Refresh between waves';
        never = 'replace the survey';
      } else if (['ADOPTION', 'DIGITAL', 'CHANNEL_PREF'].includes(dim.dimension_code)) {
        approver = 'P4';
        aiRole = 'Infer and suggest';
        never = 'change silently';
      } else if (['ACC_TIER', 'ACC_POTENTIAL', 'ACCESS_STATUS'].includes(dim.dimension_code)) {
        approver = 'P3';
        aiRole = 'Propose';
        never = 'overwrite';
      } else if (['ACC_ARCHETYPE', 'DECISION_MODEL', 'TREATMENT_CAP'].includes(dim.dimension_code)) {
        approver = 'P3';
        coApprover = 'P1';
        aiRole = 'Flag for review';
        never = 'change between cycles';
      }

      approvalRights.push({
        market_code: market,
        dimension_code: dim.dimension_code,
        maintained_by_today:
          market === 'MKT_C' && dim.dimension_code === 'POTENTIAL'
            ? 'Field Reps + Annual Excel'
            : 'Commercial Ops',
        approver_role: approver,
        ai_role: aiRole,
        never,
        co_approver_role: coApprover,
      });
    }
  }

  const thresholds: Threshold[] = [
    // Spec examples:
    {
      market_code: 'MKT_A',
      dimension_code: 'SEGMENT',
      signal_type: 'HCP TRx change',
      threshold_value: '±15%',
      unit: '% QoQ',
      min_independent_signals: 2,
      min_confidence: 'High',
      lookback_days: 90,
    },
    {
      market_code: 'MKT_B',
      dimension_code: 'SEGMENT',
      signal_type: 'brick sales change',
      threshold_value: '±10%',
      unit: '% QoQ',
      min_independent_signals: 2,
      min_confidence: 'Medium',
      lookback_days: 90,
    },
    {
      market_code: 'MKT_C',
      dimension_code: 'ADOPTION',
      signal_type: 'rep observation',
      threshold_value: '1 structured rep assessment + 1 CRM signal',
      unit: 'signals',
      min_independent_signals: 2,
      min_confidence: 'Medium',
      lookback_days: 120,
    },
    // Supporting thresholds:
    {
      market_code: 'MKT_A',
      dimension_code: 'ADOPTION',
      signal_type: 'Rx trial & volume trend',
      threshold_value: '+20%',
      unit: '% 90d',
      min_independent_signals: 2,
      min_confidence: 'Medium',
      lookback_days: 90,
    },
    {
      market_code: 'MKT_A',
      dimension_code: 'DIGITAL',
      signal_type: 'Portal sessions & email CTR',
      threshold_value: '≥5 sessions/mo',
      unit: 'sessions',
      min_independent_signals: 2,
      min_confidence: 'Medium',
      lookback_days: 60,
    },
    {
      market_code: 'MKT_B',
      dimension_code: 'ADOPTION',
      signal_type: 'Rep note & CRM activity',
      threshold_value: 'Confirmed patient starts ≥3',
      unit: 'patients',
      min_independent_signals: 2,
      min_confidence: 'High',
      lookback_days: 90,
    },
    {
      market_code: 'MKT_B',
      dimension_code: 'DIGITAL',
      signal_type: 'Portal activity & webinar attendance',
      threshold_value: '+50% 60d',
      unit: '% change',
      min_independent_signals: 2,
      min_confidence: 'Medium',
      lookback_days: 60,
    },
    {
      market_code: 'MKT_B',
      dimension_code: 'ACCESS_STATUS',
      signal_type: 'Hospital formulary update',
      threshold_value: 'Formal committee decision',
      unit: 'tender outcome',
      min_independent_signals: 1,
      min_confidence: 'High',
      lookback_days: 30,
    },
    {
      market_code: 'MKT_B',
      dimension_code: 'ACC_TIER',
      signal_type: 'Formulary listing win',
      threshold_value: 'Status change to Listed',
      unit: 'status',
      min_independent_signals: 1,
      min_confidence: 'High',
      lookback_days: 30,
    },
    {
      market_code: 'MKT_C',
      dimension_code: 'SEGMENT',
      signal_type: 'Account sell-in + PMR wave',
      threshold_value: '±25% annualised',
      unit: '% QoQ',
      min_independent_signals: 2,
      min_confidence: 'Medium',
      lookback_days: 180,
    },
    {
      market_code: 'MKT_C',
      dimension_code: 'POTENTIAL',
      signal_type: 'Rep potential survey update',
      threshold_value: 'Score change ≥1 tier',
      unit: 'score',
      min_independent_signals: 1,
      min_confidence: 'Medium',
      lookback_days: 120,
    },
  ];

  const stabilityPolicy: StabilityPolicy = {
    MKT_A: {
      max_changes_per_customer_per_180d: 2,
      freeze_windows: [
        {
          name: 'Q4 incentive period',
          start: '2026-10-01',
          end: '2026-10-31',
        },
      ],
      conflict_rule: 'hold_if_signals_disagree',
      min_days_between_changes: 60,
      stable_dimensions: ['BEHAVIOURAL', 'ACC_ARCHETYPE', 'DECISION_MODEL', 'TREATMENT_CAP'],
    },
    MKT_B: {
      max_changes_per_customer_per_180d: 2,
      freeze_windows: [
        {
          name: 'Annual planning freeze',
          start: '2026-12-01',
          end: '2026-12-31',
        },
      ],
      conflict_rule: 'hold_if_signals_disagree',
      min_days_between_changes: 60,
      stable_dimensions: ['BEHAVIOURAL', 'ACC_ARCHETYPE', 'DECISION_MODEL', 'TREATMENT_CAP'],
    },
    MKT_C: {
      max_changes_per_customer_per_180d: 2,
      freeze_windows: [
        {
          name: 'Territory alignment freeze',
          start: '2027-01-01',
          end: '2027-01-20',
        },
      ],
      conflict_rule: 'hold_if_signals_disagree',
      min_days_between_changes: 60,
      stable_dimensions: ['BEHAVIOURAL', 'ACC_ARCHETYPE', 'DECISION_MODEL', 'TREATMENT_CAP'],
    },
  };

  const vocabularyMap: VocabularyMapEntry[] = [
    // MKT_A K-means mappings
    { market_code: 'MKT_A', source: 'Studio', source_dimension: 'cluster', source_value: 'cluster_0', global_dimension: 'SEGMENT', global_value: 'E', mapped_by: 'AI', confidence: 0.94, status: 'Accepted' },
    { market_code: 'MKT_A', source: 'Studio', source_dimension: 'cluster', source_value: 'cluster_1', global_dimension: 'SEGMENT', global_value: 'D', mapped_by: 'AI', confidence: 0.91, status: 'Accepted' },
    { market_code: 'MKT_A', source: 'Studio', source_dimension: 'cluster', source_value: 'cluster_2', global_dimension: 'SEGMENT', global_value: 'A', mapped_by: 'AI', confidence: 0.96, status: 'Accepted' },
    { market_code: 'MKT_A', source: 'Studio', source_dimension: 'cluster', source_value: 'cluster_3', global_dimension: 'SEGMENT', global_value: 'B', mapped_by: 'AI', confidence: 0.89, status: 'Accepted' },
    { market_code: 'MKT_A', source: 'Studio', source_dimension: 'cluster', source_value: 'cluster_4', global_dimension: 'SEGMENT', global_value: 'C', mapped_by: 'AI', confidence: 0.92, status: 'Accepted' },
    { market_code: 'MKT_A', source: 'Studio', source_dimension: 'cluster', source_value: 'cluster_2', global_dimension: 'BEHAVIOURAL', global_value: 'Engaged', mapped_by: 'AI', confidence: 0.95, status: 'Accepted' },

    // MKT_B legacy tool tiers
    { market_code: 'MKT_B', source: 'Legacy tool', source_dimension: 'tier', source_value: 'T1', global_dimension: 'SEGMENT', global_value: 'A', mapped_by: 'User', confidence: 1.0, status: 'Accepted' },
    { market_code: 'MKT_B', source: 'Legacy tool', source_dimension: 'tier', source_value: 'T2', global_dimension: 'SEGMENT', global_value: 'B', mapped_by: 'User', confidence: 1.0, status: 'Accepted' },
    { market_code: 'MKT_B', source: 'Legacy tool', source_dimension: 'tier', source_value: 'T3', global_dimension: 'SEGMENT', global_value: 'C', mapped_by: 'User', confidence: 1.0, status: 'Accepted' },
    { market_code: 'MKT_B', source: 'Legacy tool', source_dimension: 'tier', source_value: 'T4', global_dimension: 'SEGMENT', global_value: 'D', mapped_by: 'User', confidence: 1.0, status: 'Accepted' },

    // MKT_C vendor mappings
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Segmen', source_value: 'Gold', global_dimension: 'SEGMENT', global_value: 'A', mapped_by: 'AI', confidence: 0.93, status: 'Accepted' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Segmen', source_value: 'Silver', global_dimension: 'SEGMENT', global_value: 'B', mapped_by: 'AI', confidence: 0.91, status: 'Accepted' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Segmen', source_value: 'Bronze', global_dimension: 'SEGMENT', global_value: 'C', mapped_by: 'AI', confidence: 0.88, status: 'Accepted' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Pot_Class', source_value: 'High', global_dimension: 'POTENTIAL', global_value: '4', mapped_by: 'AI', confidence: 0.95, status: 'Accepted' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Pot_Class', source_value: 'Med', global_dimension: 'POTENTIAL', global_value: '3', mapped_by: 'AI', confidence: 0.92, status: 'Accepted' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Pot_Class', source_value: 'Low', global_dimension: 'POTENTIAL', global_value: '2', mapped_by: 'AI', confidence: 0.84, status: 'Pending' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Pot_Class', source_value: 'Low (decile 1)', global_dimension: 'POTENTIAL', global_value: '1', mapped_by: 'AI', confidence: 0.81, status: 'Pending' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Adopt', source_value: 'Aware', global_dimension: 'ADOPTION', global_value: 'Aware', mapped_by: 'AI', confidence: 0.98, status: 'Accepted' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Adopt', source_value: 'Trying', global_dimension: 'ADOPTION', global_value: 'Trial', mapped_by: 'AI', confidence: 0.94, status: 'Accepted' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Adopt', source_value: 'Using', global_dimension: 'ADOPTION', global_value: 'Adoption', mapped_by: 'AI', confidence: 0.92, status: 'Accepted' },
    { market_code: 'MKT_C', source: 'Vendor', source_dimension: 'Adopt', source_value: 'Loyal', global_dimension: 'ADOPTION', global_value: 'Expansion', mapped_by: 'AI', confidence: 0.90, status: 'Accepted' },
  ];

  writeJsonFile('dimensions.json', dimensions);
  writeJsonFile('approval_rights.json', approvalRights);
  writeJsonFile('thresholds.json', thresholds);
  writeJsonFile('stability_policy.json', stabilityPolicy);
  writeJsonFile('vocabulary_map.json', vocabularyMap);

  return { dimensions, approvalRights, thresholds, stabilityPolicy, vocabularyMap };
}
