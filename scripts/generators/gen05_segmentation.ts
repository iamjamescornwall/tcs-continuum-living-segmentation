/**
 * Prompt 5: Segmentation generator
 * Produces segment_assignments.json, segment_history.json,
 * segment_library.json, studio_outputs.json
 */

import {
  SegmentAssignment,
  SegmentHistory,
  SegmentLibraryVersion,
  StudioOutput,
  HCP,
  Account,
  BrandCode,
} from '../../src/types';
import { GeneratorContext, writeJsonFile } from '../utils';

export function generateSegmentationData(
  ctx: GeneratorContext,
  hcps: HCP[],
  accounts: Account[]
): {
  assignments: SegmentAssignment[];
  history: SegmentHistory[];
  library: SegmentLibraryVersion[];
  studioOutputs: StudioOutput[];
} {
  const assignments: SegmentAssignment[] = [];
  const history: SegmentHistory[] = [];

  const DEMO_TODAY = '2026-10-15';

  function daysAgoDate(days: number): string {
    const d = new Date(DEMO_TODAY);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  // Helper to generate a realistic set_date based on market age distribution
  function generateSetDate(market: 'MKT_A' | 'MKT_B' | 'MKT_C'): string {
    // Median: A ~70 days, B ~210 days, C ~330 days
    // % stale (>180d): A 12%, B 58%, C 81%
    if (market === 'MKT_A') {
      const isStale = ctx.rng() < 0.12;
      const days = isStale ? ctx.randomInt(181, 280) : ctx.randomInt(20, 110);
      return daysAgoDate(days);
    } else if (market === 'MKT_B') {
      const isStale = ctx.rng() < 0.58;
      const days = isStale ? ctx.randomInt(185, 340) : ctx.randomInt(40, 175);
      return daysAgoDate(days);
    } else {
      const isStale = ctx.rng() < 0.81;
      const days = isStale ? ctx.randomInt(240, 360) : ctx.randomInt(60, 170);
      return daysAgoDate(days);
    }
  }

  // 1. HCP Assignments
  hcps.forEach((hcp) => {
    const isHeroB0001 = hcp.hcp_id === 'HCP-B-0001';
    const isHeroC0001 = hcp.hcp_id === 'HCP-C-0001';
    const isRuralBiasGp = hcp.hcp_id >= 'HCP-A-0100' && hcp.hcp_id <= 'HCP-A-0140';

    const hcpBrands: BrandCode[] =
      hcp.market_code === 'MKT_C'
        ? ['AUR', 'ZEN', 'CRD']
        : ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'];

    hcpBrands.forEach((brandCode) => {
      const isHeroAurelix = isHeroB0001 && brandCode === 'AUR';
      const isHeroC0001Aur = isHeroC0001 && brandCode === 'AUR';

      // Pick segment value according to market distribution for Aurelix
      let segVal: string;
      if (isHeroAurelix) {
        segVal = 'B';
      } else if (isRuralBiasGp && brandCode === 'BRV') {
        // Brevanta rural GPs under-represented in Segment A
        segVal = ctx.weightedChoice(['A', 'B', 'C', 'D', 'E'], [0.02, 0.08, 0.25, 0.40, 0.25]);
      } else if (hcp.market_code === 'MKT_A') {
        segVal = ctx.weightedChoice(['A', 'B', 'C', 'D', 'E'], [0.08, 0.17, 0.30, 0.25, 0.20]);
      } else if (hcp.market_code === 'MKT_B') {
        segVal = ctx.weightedChoice(['A', 'B', 'C', 'D', 'E'], [0.12, 0.22, 0.28, 0.20, 0.18]);
      } else {
        // MKT_C inflates top segments
        segVal = ctx.weightedChoice(['A', 'B', 'C', 'D', 'E'], [0.20, 0.30, 0.25, 0.15, 0.10]);
      }

      // Potential
      let potVal = isHeroAurelix ? '3' : ctx.choice(['1', '2', '3', '4']);
      let isGapFilled = false;
      if (isHeroC0001Aur) {
        potVal = '3';
        isGapFilled = true;
      } else if (hcp.market_code === 'MKT_C') {
        isGapFilled = ctx.rng() < 0.34;
      } else if (hcp.market_code === 'MKT_B') {
        isGapFilled = ctx.rng() < 0.09;
      }

      // Dates
      const setDate = isHeroAurelix ? '2026-05-04' : generateSetDate(hcp.market_code);

      // Other dimensions for hero
      const behavVal = isHeroAurelix ? 'Traditionalist' : ctx.choice(['Traditionalist', 'Pragmatist', 'Engaged', 'Advocate']);
      const attVal = isHeroAurelix ? 'Late majority' : ctx.choice(['Early adopter', 'Early majority', 'Late majority', 'Sceptic']);
      const digVal = isHeroAurelix ? 'Evolving' : ctx.choice(['Traditional', 'Evolving', 'Savvy']);
      const adoptVal = isHeroAurelix ? 'Consideration' : (isHeroC0001Aur ? 'Consideration' : ctx.choice(['Unaware', 'Aware', 'Consideration', 'Trial', 'Adoption', 'Expansion']));
      const chanVal = isHeroAurelix ? 'Portal' : ctx.choice(['Face-to-face', 'Remote', 'Email', 'Portal', 'Events', 'Mixed']);
      const microVal = ctx.choice(['MS-01', 'MS-02', 'MS-03', 'MS-04', 'None']);

      const versionId = hcp.market_code === 'MKT_A' ? 'VER-0001' : (hcp.market_code === 'MKT_B' ? 'VER-0003' : 'VER-0004');

      // Add assignments
      const hcpDims: Array<{ code: any; val: string; gap?: boolean }> = [
        { code: 'SEGMENT', val: segVal },
        { code: 'POTENTIAL', val: potVal, gap: isGapFilled },
        { code: 'ADOPTION', val: adoptVal },
        { code: 'BEHAVIOURAL', val: behavVal },
        { code: 'ATTITUDINAL', val: attVal },
        { code: 'DIGITAL', val: digVal },
        { code: 'CHANNEL_PREF', val: chanVal },
        { code: 'MICRO_SEGMENT', val: microVal },
      ];

      hcpDims.forEach((dim) => {
        assignments.push({
          market_code: hcp.market_code,
          customer_type: 'HCP',
          customer_id: hcp.hcp_id,
          brand_code: brandCode,
          indication_code: brandCode === 'AUR' ? 'AUR_PSO' : null,
          dimension_code: dim.code,
          value: dim.val,
          set_date: setDate,
          set_by: hcp.market_code === 'MKT_C' ? 'Agency file' : (dim.code === 'ADOPTION' ? 'Rep' : 'Back office'),
          source_version_id: versionId,
          confidence: isHeroAurelix ? 'High' : (dim.gap ? 'Low' : ctx.choice(['High', 'Medium', 'Low'])),
          gap_filled: dim.gap || false,
        });
      });
    });
  });

  // 2. HCO Assignments
  accounts.forEach((acc) => {
    const accBrands: BrandCode[] =
      acc.market_code === 'MKT_C' ? ['AUR', 'ZEN', 'CRD'] : ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'];

    accBrands.forEach((brandCode) => {
      const isHeroAccZen = acc.hco_id === 'ACC-B-001' && brandCode === 'ZEN';
      const accessStatus = isHeroAccZen ? 'Listed' : ctx.choice(['Listed', 'Restricted', 'Under review', 'Not listed']);
      const tierVal = isHeroAccZen ? 'Tier 1' : ctx.choice(['Tier 1', 'Tier 2', 'Tier 3']);
      const setDate = isHeroAccZen ? '2026-10-08' : generateSetDate(acc.market_code);

      const hcoDims: Array<{ code: any; val: string }> = [
        { code: 'ACC_ARCHETYPE', val: acc.archetype },
        { code: 'ACC_POTENTIAL', val: ctx.choice(['1', '2', '3', '4']) },
        { code: 'ACCESS_STATUS', val: accessStatus },
        { code: 'DECISION_MODEL', val: acc.decision_model },
        { code: 'TREATMENT_CAP', val: acc.treatment_capability },
        { code: 'ACC_TIER', val: tierVal },
      ];

      hcoDims.forEach((dim) => {
        assignments.push({
          market_code: acc.market_code,
          customer_type: 'HCO',
          customer_id: acc.hco_id,
          brand_code: brandCode,
          indication_code: null,
          dimension_code: dim.code,
          value: dim.val,
          set_date: setDate,
          set_by: isHeroAccZen ? 'KAM' : 'Back office',
          source_version_id: 'VER-0003',
          confidence: 'High',
          gap_filled: false,
        });
      });
    });
  });

  // 3. segment_history.json
  let histId = 1;
  // Hero HCP history
  history.push(
    {
      history_id: `HIST-${String(histId++).padStart(6, '0')}`,
      customer_id: 'HCP-B-0001',
      customer_type: 'HCP',
      brand_code: 'AUR',
      dimension_code: 'SEGMENT',
      value: 'C',
      valid_from: '2025-05-01',
      valid_to: '2026-05-04',
      change_reason: 'Annual refresh',
      approver_user_id: 'USR-002',
    },
    {
      history_id: `HIST-${String(histId++).padStart(6, '0')}`,
      customer_id: 'HCP-B-0001',
      customer_type: 'HCP',
      brand_code: 'AUR',
      dimension_code: 'SEGMENT',
      value: 'B',
      valid_from: '2026-05-04',
      valid_to: null,
      change_reason: 'Annual refresh',
      approver_user_id: 'USR-002',
    }
  );

  // 3 historic informal overrides with NO approver in MKT_B (pre-Continuum) per DATA_SPEC 6.2
  history.push(
    {
      history_id: `HIST-${String(histId++).padStart(6, '0')}`,
      customer_id: 'HCP-B-0050',
      customer_type: 'HCP',
      brand_code: 'AUR',
      dimension_code: 'SEGMENT',
      value: 'A',
      valid_from: '2025-08-10',
      valid_to: null,
      change_reason: 'Override',
      approver_user_id: null, // Informal override without approver
    },
    {
      history_id: `HIST-${String(histId++).padStart(6, '0')}`,
      customer_id: 'HCP-B-0055',
      customer_type: 'HCP',
      brand_code: 'ZEN',
      dimension_code: 'SEGMENT',
      value: 'B',
      valid_from: '2025-09-01',
      valid_to: null,
      change_reason: 'Override',
      approver_user_id: null,
    },
    {
      history_id: `HIST-${String(histId++).padStart(6, '0')}`,
      customer_id: 'HCP-B-0060',
      customer_type: 'HCP',
      brand_code: 'CRD',
      dimension_code: 'SEGMENT',
      value: 'B',
      valid_from: '2025-09-15',
      valid_to: null,
      change_reason: 'Override',
      approver_user_id: null,
    }
  );

  // Additional history records for sample customers
  for (let i = 1; i <= 80; i++) {
    const hcp = ctx.choice(hcps);
    history.push({
      history_id: `HIST-${String(histId++).padStart(6, '0')}`,
      customer_id: hcp.hcp_id,
      customer_type: 'HCP',
      brand_code: 'AUR',
      dimension_code: 'SEGMENT',
      value: ctx.choice(['B', 'C', 'D']),
      valid_from: '2025-01-10',
      valid_to: '2026-01-10',
      change_reason: 'Annual refresh',
      approver_user_id: 'USR-002',
    });
  }

  // 4. segment_library.json
  const library: SegmentLibraryVersion[] = [
    {
      version_id: 'VER-0001',
      name: 'Market A Aurelix K-Means Segmentation v2.1',
      market_code: 'MKT_A',
      brand_code: 'AUR',
      customer_type: 'HCP',
      method: 'KMEANS',
      parameters: {
        k: 5,
        features: ['trx_qoq_change', 'portal_visits_3m', 'pmr_attitudinal'],
      },
      status: 'Active',
      author_user_id: 'USR-003',
      created_date: '2026-07-15',
      approved_by: 'USR-001',
      approved_date: '2026-07-20',
      activated_date: '2026-08-01',
      records_segmented: 600,
      mapped_to_global: true,
      notes: 'Active quarterly refresh model for Market A Aurelix launch tracking.',
    },
    {
      version_id: 'VER-0002',
      name: 'Market A Aurelix K-Means Segmentation v1.0',
      market_code: 'MKT_A',
      brand_code: 'AUR',
      customer_type: 'HCP',
      method: 'KMEANS',
      parameters: {
        k: 4,
        features: ['trx_qoq_change', 'portal_visits_3m'],
      },
      status: 'Retired',
      author_user_id: 'USR-003',
      created_date: '2026-01-10',
      approved_by: 'USR-001',
      approved_date: '2026-01-15',
      activated_date: '2026-02-01',
      records_segmented: 580,
      mapped_to_global: true,
      notes: 'Previous baseline segmentation model.',
    },
    {
      version_id: 'VER-0003',
      name: 'Market B Aurelix Decile Rules v3.0',
      market_code: 'MKT_B',
      brand_code: 'AUR',
      customer_type: 'HCP',
      method: 'RULES',
      parameters: {
        features: ['brick_sales_qoq_change', 'call_acceptance_rate'],
      },
      status: 'Active',
      author_user_id: 'USR-002',
      created_date: '2026-05-01',
      approved_by: 'USR-001',
      approved_date: '2026-05-03',
      activated_date: '2026-05-04',
      records_segmented: 400,
      mapped_to_global: true,
      notes: 'Decile rules with behavioral adjustments.',
    },
    {
      version_id: 'VER-0004',
      name: 'Market C Agency File 2025',
      market_code: 'MKT_C',
      brand_code: 'AUR',
      customer_type: 'HCP',
      method: 'RULES',
      parameters: {},
      status: 'Active',
      author_user_id: 'USR-004',
      created_date: '2025-11-20',
      approved_by: 'USR-004',
      approved_date: '2025-11-25',
      activated_date: '2025-12-01',
      records_segmented: 250,
      mapped_to_global: false, // Not mapped until demo onboarding!
      notes: 'Imported from local vendor agency Excel spreadsheet.',
    },
    {
      version_id: 'VER-0005',
      name: 'Market C Aurelix Rules Template v1.0',
      market_code: 'MKT_C',
      brand_code: 'AUR',
      customer_type: 'HCP',
      method: 'RULES_TEMPLATE',
      parameters: {
        weights: { volume_proxy: 0.5, pmr_intent: 0.3, rep_assessment: 0.2 },
      },
      status: 'Draft',
      author_user_id: 'USR-004',
      created_date: '2026-10-12',
      approved_by: null,
      approved_date: null,
      activated_date: null,
      records_segmented: 250,
      mapped_to_global: true,
      notes: 'Standardized rules template created in Segmentation Studio.',
    },
    // Supporting library versions
    {
      version_id: 'VER-0006',
      name: 'Market A Zentrova K-Means v1.2',
      market_code: 'MKT_A',
      brand_code: 'ZEN',
      customer_type: 'HCP',
      method: 'KMEANS',
      parameters: { k: 4 },
      status: 'Active',
      author_user_id: 'USR-003',
      created_date: '2026-06-10',
      approved_by: 'USR-001',
      approved_date: '2026-06-15',
      activated_date: '2026-07-01',
      records_segmented: 600,
      mapped_to_global: true,
      notes: 'Oncology prescriber clustering.',
    },
    {
      version_id: 'VER-0007',
      name: 'Market B Zentrova Account Model',
      market_code: 'MKT_B',
      brand_code: 'ZEN',
      customer_type: 'HCO',
      method: 'RULES',
      parameters: {},
      status: 'Active',
      author_user_id: 'USR-005',
      created_date: '2026-04-12',
      approved_by: 'USR-001',
      approved_date: '2026-04-18',
      activated_date: '2026-05-01',
      records_segmented: 80,
      mapped_to_global: true,
      notes: 'Account tiering and access rules.',
    },
    {
      version_id: 'VER-0008',
      name: 'Market A Brevanta Hybrid v2.0',
      market_code: 'MKT_A',
      brand_code: 'BRV',
      customer_type: 'HCP',
      method: 'HYBRID',
      parameters: {},
      status: 'Active',
      author_user_id: 'USR-003',
      created_date: '2026-03-01',
      approved_by: 'USR-001',
      approved_date: '2026-03-10',
      activated_date: '2026-04-01',
      records_segmented: 600,
      mapped_to_global: true,
      notes: 'Respiratory specialist and GP mix segmentation.',
    },
  ];

  // 5. studio_outputs.json
  const studioOutputs: StudioOutput[] = [
    {
      version_id: 'VER-0001',
      clusters: [
        {
          cluster_id: 'cluster_0',
          cluster_size: 120,
          centroid: { trx_qoq_change: -0.15, portal_visits_3m: 1, pmr_attitudinal: 1 },
          feature_importance: [
            { feature: 'trx_qoq_change', importance: 0.48 },
            { feature: 'portal_visits_3m', importance: 0.32 },
            { feature: 'pmr_attitudinal', importance: 0.20 },
          ],
          box_stats: [
            { feature: 'trx_qoq_change', min: -0.35, q1: -0.22, median: -0.15, q3: -0.08, max: 0.02 },
            { feature: 'portal_visits_3m', min: 0, q1: 0, median: 1, q3: 2, max: 3 },
          ],
          suggested_name: 'Low Prescribing / Traditional',
          suggested_global_value: 'E',
        },
        {
          cluster_id: 'cluster_1',
          cluster_size: 150,
          centroid: { trx_qoq_change: -0.02, portal_visits_3m: 2, pmr_attitudinal: 2 },
          feature_importance: [
            { feature: 'trx_qoq_change', importance: 0.44 },
            { feature: 'portal_visits_3m', importance: 0.35 },
            { feature: 'pmr_attitudinal', importance: 0.21 },
          ],
          box_stats: [
            { feature: 'trx_qoq_change', min: -0.10, q1: -0.05, median: -0.02, q3: 0.03, max: 0.08 },
            { feature: 'portal_visits_3m', min: 0, q1: 1, median: 2, q3: 3, max: 5 },
          ],
          suggested_name: 'Stable / Pragmatist',
          suggested_global_value: 'D',
        },
        {
          cluster_id: 'cluster_2',
          cluster_size: 48,
          centroid: { trx_qoq_change: 0.28, portal_visits_3m: 8, pmr_attitudinal: 4 },
          feature_importance: [
            { feature: 'trx_qoq_change', importance: 0.52 },
            { feature: 'portal_visits_3m', importance: 0.31 },
            { feature: 'pmr_attitudinal', importance: 0.17 },
          ],
          box_stats: [
            { feature: 'trx_qoq_change', min: 0.18, q1: 0.22, median: 0.28, q3: 0.36, max: 0.52 },
            { feature: 'portal_visits_3m', min: 5, q1: 6, median: 8, q3: 11, max: 16 },
          ],
          suggested_name: 'High Growth / Engaged Champion',
          suggested_global_value: 'A',
        },
        {
          cluster_id: 'cluster_3',
          cluster_size: 102,
          centroid: { trx_qoq_change: 0.14, portal_visits_3m: 5, pmr_attitudinal: 3 },
          feature_importance: [
            { feature: 'trx_qoq_change', importance: 0.49 },
            { feature: 'portal_visits_3m', importance: 0.33 },
            { feature: 'pmr_attitudinal', importance: 0.18 },
          ],
          box_stats: [
            { feature: 'trx_qoq_change', min: 0.08, q1: 0.11, median: 0.14, q3: 0.19, max: 0.26 },
            { feature: 'portal_visits_3m', min: 3, q1: 4, median: 5, q3: 7, max: 9 },
          ],
          suggested_name: 'Expanding Adopters',
          suggested_global_value: 'B',
        },
        {
          cluster_id: 'cluster_4',
          cluster_size: 180,
          centroid: { trx_qoq_change: 0.04, portal_visits_3m: 3, pmr_attitudinal: 2 },
          feature_importance: [
            { feature: 'trx_qoq_change', importance: 0.46 },
            { feature: 'portal_visits_3m', importance: 0.34 },
            { feature: 'pmr_attitudinal', importance: 0.20 },
          ],
          box_stats: [
            { feature: 'trx_qoq_change', min: 0.00, q1: 0.02, median: 0.04, q3: 0.07, max: 0.11 },
            { feature: 'portal_visits_3m', min: 1, q1: 2, median: 3, q3: 4, max: 6 },
          ],
          suggested_name: 'Moderate Prescribers',
          suggested_global_value: 'C',
        },
      ],
      before_after_counts: [
        { from: 'B', to: 'A', count: 18 },
        { from: 'C', to: 'B', count: 32 },
        { from: 'D', to: 'C', count: 24 },
        { from: 'E', to: 'D', count: 12 },
        { from: 'C', to: 'D', count: 15 },
      ],
    },
    {
      version_id: 'VER-0005',
      clusters: [
        {
          cluster_id: 'grid_tier_1',
          cluster_size: 50,
          centroid: { volume_proxy: 4, pmr_intent: 4, rep_assessment: 4 },
          feature_importance: [
            { feature: 'volume_proxy', importance: 0.5 },
            { feature: 'pmr_intent', importance: 0.3 },
            { feature: 'rep_assessment', importance: 0.2 },
          ],
          box_stats: [],
          suggested_name: 'Key High Potential Specialists',
          suggested_global_value: 'A',
        },
        {
          cluster_id: 'grid_tier_2',
          cluster_size: 75,
          centroid: { volume_proxy: 3, pmr_intent: 3, rep_assessment: 3 },
          feature_importance: [
            { feature: 'volume_proxy', importance: 0.5 },
            { feature: 'pmr_intent', importance: 0.3 },
            { feature: 'rep_assessment', importance: 0.2 },
          ],
          box_stats: [],
          suggested_name: 'Moderate Core Target',
          suggested_global_value: 'B',
        },
      ],
      before_after_counts: [
        { from: 'Gold', to: 'A', count: 50 },
        { from: 'Silver', to: 'B', count: 75 },
        { from: 'Bronze', to: 'C', count: 62 },
      ],
    },
  ];

  writeJsonFile('segment_assignments.json', assignments);
  writeJsonFile('segment_history.json', history);
  writeJsonFile('segment_library.json', library);
  writeJsonFile('studio_outputs.json', studioOutputs);

  return { assignments, history, library, studioOutputs };
}
