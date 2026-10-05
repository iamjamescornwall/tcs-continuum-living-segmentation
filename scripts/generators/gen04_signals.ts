/**
 * Prompt 4: Signals generator
 * Produces sales.json, crm_activity.json, digital_engagement.json,
 * pmr_responses.json, formulary_status.json, kol_influence.json,
 * rep_notes.json, feature_store.json
 */

import {
  SalesRecord,
  CrmActivity,
  DigitalEngagement,
  PmrResponse,
  FormularyStatus,
  KolInfluence,
  RepNote,
  FeatureStoreItem,
  HCP,
  Account,
  ConsentRecord,
  Brand,
  BrandCode,
} from '../../src/types';
import { HERO_NOTE_000001 } from '../heroes';
import { GeneratorContext, writeJsonFile } from '../utils';

export function generateSignalsData(
  ctx: GeneratorContext,
  hcps: HCP[],
  accounts: Account[],
  consent: ConsentRecord[],
  _brands: Brand[]
): {
  sales: SalesRecord[];
  crmActivity: CrmActivity[];
  digitalEngagement: DigitalEngagement[];
  pmrResponses: PmrResponse[];
  formularyStatus: FormularyStatus[];
  kolInfluence: KolInfluence[];
  repNotes: RepNote[];
  featureStore: FeatureStoreItem[];
} {
  // 1. sales.json
  const sales: SalesRecord[] = [];
  const monthlyPeriods = [
    '2025-10', '2025-11', '2025-12',
    '2026-01', '2026-02', '2026-03',
    '2026-04', '2026-05', '2026-06',
    '2026-07', '2026-08', '2026-09',
  ];
  const quarterlyPeriods = ['2025-Q4', '2026-Q1', '2026-Q2', '2026-Q3'];

  // MKT_A: HCP-level sales for 600 HCPs x 5 brands x 12 months = 36,000 rows
  // Top decile has ~45% volume.
  const hcpsA = hcps.filter((h) => h.market_code === 'MKT_A');
  const brandsA: BrandCode[] = ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'];

  hcpsA.forEach((hcp, hcpIdx) => {
    const isTopDecile = hcpIdx < 60;
    const baseHcpFactor = isTopDecile ? ctx.randomFloat(4.0, 7.5) : ctx.randomFloat(0.3, 1.5);

    brandsA.forEach((brandCode) => {
      let currentTrx = Math.round(ctx.randomInt(10, 30) * baseHcpFactor);

      monthlyPeriods.forEach((period, _monthIdx) => {
        // Growth trajectory by brand
        let growthRate = 0;
        if (brandCode === 'AUR') growthRate = ctx.randomFloat(0.06, 0.10); // Rising launch
        else if (brandCode === 'ZEN') growthRate = ctx.randomFloat(0.02, 0.05); // Growing
        else if (brandCode === 'CRD') growthRate = ctx.randomFloat(-0.01, 0.01); // Flat
        else if (brandCode === 'NEU') growthRate = ctx.randomFloat(0.03, 0.06); // Growing
        else if (brandCode === 'BRV') growthRate = ctx.randomFloat(-0.02, 0.005); // Mature / flat

        currentTrx = Math.max(1, Math.round(currentTrx * (1 + growthRate)));
        const nrx = Math.max(0, Math.round(currentTrx * ctx.randomFloat(0.25, 0.40)));
        const nbrx = Math.max(0, Math.round(nrx * ctx.randomFloat(0.15, 0.35)));
        const units = currentTrx * ctx.randomInt(1, 3);
        const pricePerUnit = brandCode === 'AUR' ? 1250 : brandCode === 'ZEN' ? 2400 : 350;
        const value_usd = units * pricePerUnit;
        const market_share = ctx.round(ctx.randomFloat(0.12, 0.45), 3);

        sales.push({
          market_code: 'MKT_A',
          granularity: 'HCP',
          entity_id: hcp.hcp_id,
          brand_code: brandCode,
          period,
          trx: currentTrx,
          nrx,
          nbrx,
          units,
          value_usd,
          market_share,
        });
      });
    });
  });

  // MKT_B: Brick-level sales (60 bricks x 5 brands x 12 months = 3,600 rows)
  // BRK-B-014: Hero brick Aurelix +12% QoQ in latest quarter!
  const bricksB: string[] = [];
  for (let i = 1; i <= 60; i++) {
    bricksB.push(`BRK-B-${String(i).padStart(3, '0')}`);
  }
  const brandsB: BrandCode[] = ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'];

  bricksB.forEach((brickId) => {
    const isHeroBrick = brickId === 'BRK-B-014';

    brandsB.forEach((brandCode) => {
      let baseUnits = isHeroBrick && brandCode === 'AUR' ? 450 : ctx.randomInt(100, 350);

      monthlyPeriods.forEach((period, monthIdx) => {
        let monthlyGrowth = ctx.randomFloat(-0.01, 0.03);

        if (isHeroBrick && brandCode === 'AUR') {
          // Last 3 months (2026-07..09) vs previous 3 months (2026-04..06) +12% QoQ
          if (monthIdx >= 9) {
            monthlyGrowth = 0.045; // ~12% across quarter
          } else {
            monthlyGrowth = 0.01;
          }
        }

        baseUnits = Math.round(baseUnits * (1 + monthlyGrowth));
        const pricePerUnit = brandCode === 'AUR' ? 1250 : brandCode === 'ZEN' ? 2400 : 350;
        const value_usd = baseUnits * pricePerUnit;
        const market_share = ctx.round(ctx.randomFloat(0.15, 0.38), 3);

        sales.push({
          market_code: 'MKT_B',
          granularity: 'BRICK',
          entity_id: brickId,
          brand_code: brandCode,
          period,
          trx: null,
          nrx: null,
          nbrx: null,
          units: baseUnits,
          value_usd,
          market_share,
        });
      });
    });
  });

  // MKT_C: Account sell-in quarterly (40 accounts x 3 brands x 4 quarters = 480 rows)
  // Brands: AUR, ZEN, CRD only (NEU and BRV do not exist in C!)
  const accountsC = accounts.filter((a) => a.market_code === 'MKT_C');
  const brandsC: BrandCode[] = ['AUR', 'ZEN', 'CRD'];

  accountsC.forEach((acc) => {
    brandsC.forEach((brandCode) => {
      let qUnits = ctx.randomInt(150, 600);

      quarterlyPeriods.forEach((period) => {
        const growth = ctx.randomFloat(0.01, 0.04);
        qUnits = Math.round(qUnits * (1 + growth));
        const pricePerUnit = brandCode === 'AUR' ? 1100 : brandCode === 'ZEN' ? 2200 : 300;

        sales.push({
          market_code: 'MKT_C',
          granularity: 'ACCOUNT_SELLIN',
          entity_id: acc.hco_id,
          brand_code: brandCode,
          period,
          trx: null,
          nrx: null,
          nbrx: null,
          units: qUnits,
          value_usd: qUnits * pricePerUnit,
          market_share: null,
        });
      });
    });
  });

  // 2. crm_activity.json (~15,000 rows: ~7,000 A, 5,500 B, 2,500 C)
  const crmActivity: CrmActivity[] = [];
  let actIdCounter = 1;

  const activityChannels: Array<'F2F' | 'Remote' | 'Email-rep' | 'Event'> = ['F2F', 'Remote', 'Email-rep', 'Event'];
  const dates = [
    '2025-11-05', '2025-12-12', '2026-01-18', '2026-02-22',
    '2026-03-10', '2026-04-14', '2026-05-19', '2026-06-25',
    '2026-07-16', '2026-08-20', '2026-09-12', '2026-10-04',
  ];

  // Helper to generate CRM logs for HCPs
  function addCrmLogs(hcpList: HCP[], targetTotal: number, marketCode: 'MKT_A' | 'MKT_B' | 'MKT_C') {
    const marketBrands = marketCode === 'MKT_C' ? brandsC : ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'] as BrandCode[];
    const rowsPerHcp = Math.max(1, Math.floor(targetTotal / hcpList.length));

    hcpList.forEach((hcp) => {
      const isDecliningHcp = hcp.hcp_id === 'HCP-B-0006'; // Hero declining call acceptance

      for (let r = 0; r < rowsPerHcp; r++) {
        const brand = ctx.choice(marketBrands);
        const date = ctx.choice(dates);
        const isRecent = date.startsWith('2026-08') || date.startsWith('2026-09') || date.startsWith('2026-10');

        let outcome: 'Completed' | 'Declined' | 'No show' = 'Completed';
        if (isDecliningHcp && isRecent) {
          outcome = ctx.rng() < 0.75 ? 'Declined' : 'Completed';
        } else {
          outcome = ctx.weightedChoice(['Completed', 'Declined', 'No show'], [0.82, 0.14, 0.04]);
        }

        crmActivity.push({
          activity_id: `ACT-${String(actIdCounter++).padStart(6, '0')}`,
          market_code: marketCode,
          hcp_id: hcp.hcp_id,
          hco_id: hcp.primary_hco_id,
          brand_code: brand,
          date,
          channel: ctx.choice(activityChannels),
          outcome,
          samples_given: outcome === 'Completed' && ctx.rng() < 0.4 ? ctx.randomInt(2, 6) : 0,
          call_plan_flag: ctx.rng() < 0.85,
          rep_user_id: hcp.rep_user_id || 'USR-006',
        });
      }
    });
  }

  addCrmLogs(hcps.filter(h => h.market_code === 'MKT_A'), 7000, 'MKT_A');
  addCrmLogs(hcps.filter(h => h.market_code === 'MKT_B'), 5500, 'MKT_B');
  addCrmLogs(hcps.filter(h => h.market_code === 'MKT_C'), 2500, 'MKT_C');

  // 3. digital_engagement.json
  const digitalEngagement: DigitalEngagement[] = [];
  const consentedHcpIds = new Set(
    consent.filter((c) => c.channel === 'Portal' && c.consent_status === 'Granted').map((c) => c.hcp_id)
  );

  hcps.forEach((hcp) => {
    if (!consentedHcpIds.has(hcp.hcp_id)) return;
    const isHero = hcp.hcp_id === 'HCP-B-0001';
    const isNeurelleHero = hcp.hcp_id === 'HCP-B-0020';

    const hcpBrands = hcp.market_code === 'MKT_C' ? ['AUR', 'ZEN', 'CRD'] as BrandCode[] : ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'] as BrandCode[];
    const brand = isHero ? 'AUR' : (isNeurelleHero ? 'NEU' : ctx.choice(hcpBrands));

    monthlyPeriods.forEach((month, monthIdx) => {
      let portalVisits = ctx.randomInt(0, 3);
      if (isHero && brand === 'AUR') {
        // Spec 3.3: portal visits 3, 3, 3, 4, 5, 6 for 2026-04 … 2026-09
        const heroVisits = [1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 5, 6];
        portalVisits = heroVisits[monthIdx] || 4;
      } else if (isNeurelleHero && brand === 'NEU') {
        portalVisits = ctx.randomInt(6, 12);
      }

      digitalEngagement.push({
        market_code: hcp.market_code,
        hcp_id: hcp.hcp_id,
        brand_code: brand,
        month,
        portal_visits: portalVisits,
        email_opens: ctx.randomInt(1, 5),
        email_clicks: ctx.randomInt(0, 3),
        webinar_attended: ctx.rng() < 0.2 ? 1 : 0,
        content_minutes: portalVisits * ctx.randomInt(3, 8),
      });
    });
  });

  // 4. pmr_responses.json
  const pmrResponses: PmrResponse[] = [];
  let pmrIdCounter = 1;
  const pmrWaves: Array<{ wave: '2025-W2' | '2026-W1' | '2026-W2'; date: string }> = [
    { wave: '2025-W2', date: '2025-10-20' },
    { wave: '2026-W1', date: '2026-04-15' },
    { wave: '2026-W2', date: '2026-09-25' },
  ];

  hcps.forEach((hcp) => {
    const isHero = hcp.hcp_id === 'HCP-B-0001';
    const coverageRate = hcp.market_code === 'MKT_A' ? 0.35 : (hcp.market_code === 'MKT_B' ? 0.30 : 0.55);

    if (!isHero && ctx.rng() > coverageRate) return;

    pmrWaves.forEach((w) => {
      let attitudinal = ctx.choice(['Early adopter', 'Early majority', 'Late majority', 'Sceptic']);
      if (isHero) {
        // Hero spec: 2026-W2 is Early adopter, earlier waves Late majority
        attitudinal = w.wave === '2026-W2' ? 'Early adopter' : 'Late majority';
      }

      pmrResponses.push({
        response_id: `PMR-${String(pmrIdCounter++).padStart(6, '0')}`,
        market_code: hcp.market_code,
        hcp_id: hcp.hcp_id,
        brand_code: isHero ? 'AUR' : ctx.choice(hcp.market_code === 'MKT_C' ? brandsC : brandsA),
        wave: w.wave,
        wave_date: w.date,
        attitudinal_segment: attitudinal,
        behavioural_segment: ctx.choice(['Traditionalist', 'Pragmatist', 'Engaged', 'Advocate']),
        likelihood_to_prescribe: ctx.randomInt(4, 10),
        unmet_need_score: ctx.randomInt(2, 5),
      });
    });
  });

  // 5. formulary_status.json
  const formularyStatus: FormularyStatus[] = [];
  accounts.forEach((acc) => {
    const accBrands = acc.market_code === 'MKT_C' ? brandsC : brandsA;

    accBrands.forEach((bCode) => {
      if (acc.hco_id === 'ACC-B-001' && bCode === 'ZEN') {
        // Hero account formulary win on 2026-10-08
        formularyStatus.push({
          hco_id: 'ACC-B-001',
          market_code: 'MKT_B',
          brand_code: 'ZEN',
          status: 'Listed',
          effective_date: '2026-10-08',
          previous_status: 'Under review',
          source: 'Tender',
        });
        return;
      }

      const status: 'Listed' | 'Restricted' | 'Under review' | 'Not listed' = ctx.weightedChoice(
        ['Listed', 'Restricted', 'Under review', 'Not listed'],
        [0.55, 0.25, 0.12, 0.08]
      );
      formularyStatus.push({
        hco_id: acc.hco_id,
        market_code: acc.market_code,
        brand_code: bCode,
        status,
        effective_date: '2026-01-15',
        previous_status: status === 'Listed' ? 'Restricted' : 'Under review',
        source: ctx.choice(['Tender', 'P&T committee', 'Regional formulary']),
      });
    });
  });

  // 6. kol_influence.json
  const kolInfluence: KolInfluence[] = [];
  hcps.forEach((hcp) => {
    if (hcp.market_code === 'MKT_A') {
      if (hcp.kol_flag) {
        kolInfluence.push({
          hcp_id: hcp.hcp_id,
          market_code: 'MKT_A',
          therapy_area: 'Immunology',
          influence_score: ctx.randomInt(75, 98),
          publications_3y: ctx.randomInt(4, 18),
          congress_talks_3y: ctx.randomInt(2, 9),
          network_degree: ctx.randomInt(15, 45),
        });
      }
    } else if (hcp.market_code === 'MKT_B') {
      if (hcp.kol_flag && ctx.rng() < 0.5) {
        kolInfluence.push({
          hcp_id: hcp.hcp_id,
          market_code: 'MKT_B',
          therapy_area: 'Immunology',
          influence_score: ctx.randomInt(70, 94),
          publications_3y: ctx.randomInt(3, 14),
          congress_talks_3y: ctx.randomInt(1, 6),
          network_degree: ctx.randomInt(12, 35),
        });
      }
    } else {
      // MKT_C: exactly 8 named local experts (first 8 HCPs)
      const num = parseInt(hcp.hcp_id.replace('HCP-C-', ''), 10);
      if (num <= 8) {
        kolInfluence.push({
          hcp_id: hcp.hcp_id,
          market_code: 'MKT_C',
          therapy_area: 'Immunology',
          influence_score: ctx.randomInt(65, 88),
          publications_3y: ctx.randomInt(2, 8),
          congress_talks_3y: ctx.randomInt(1, 4),
          network_degree: ctx.randomInt(8, 22),
        });
      }
    }
  });

  // 7. rep_notes.json (~300 notes, 40 with ai_extracted: true)
  const repNotes: RepNote[] = [HERO_NOTE_000001];

  // Conflicting note for HCP-B-0007
  repNotes.push({
    note_id: 'NOTE-000002',
    market_code: 'MKT_B',
    hcp_id: 'HCP-B-0007',
    hco_id: 'ACC-B-001',
    rep_user_id: 'USR-006',
    date: '2026-10-09',
    brand_code: 'AUR',
    text: 'Trial driven by samples; unlikely to continue once initial sample stock is depleted.',
    ai_extracted: true,
    extracted_signals: [
      {
        dimension_code: 'ADOPTION',
        direction: 'Down',
        proposed_value: 'Consideration',
        evidence_quote: 'Trial driven by samples; unlikely to continue',
        confidence: 'High',
      },
    ],
  });

  // Generate ~298 more notes
  let noteCounter = 3;
  const sampleNotes = [
    'Physician expressed growing satisfaction with tolerability profile and requested patient brochures.',
    'Discussed recent clinical guidelines; physician is considering broader first-line adoption.',
    'Prefers remote contact via webinar updates; clinic volume remains high.',
    'Inquired about access status following regional tender outcome; receptive to follow-up call.',
    'Maintains high patient adherence; reported two new switches from legacy biologic.',
    'Interested in participating in upcoming advisory board or regional symposium.',
  ];

  for (let i = 3; i <= 300; i++) {
    const hcp = ctx.choice(hcps);
    const isAiExtracted = noteCounter <= 40;

    repNotes.push({
      note_id: `NOTE-${String(noteCounter++).padStart(6, '0')}`,
      market_code: hcp.market_code,
      hcp_id: hcp.hcp_id,
      hco_id: hcp.primary_hco_id || 'ACC-A-001',
      rep_user_id: hcp.rep_user_id || 'USR-006',
      date: '2026-09-18',
      brand_code: 'AUR',
      text: ctx.choice(sampleNotes),
      ai_extracted: isAiExtracted,
      extracted_signals: isAiExtracted
        ? [
            {
              dimension_code: 'ADOPTION',
              direction: 'Up',
              proposed_value: 'Trial',
              evidence_quote: 'considering broader first-line adoption',
              confidence: 'Medium',
            },
          ]
        : [],
    });
  }

  // 8. feature_store.json (25 features)
  const featureStore: FeatureStoreItem[] = [
    {
      feature_id: 'FT-01',
      feature_name: 'trx_qoq_change',
      description: 'Quarter-over-quarter % change in total brand prescriptions at HCP level',
      source_category: 'Sales',
      granularity: 'HCP',
      refresh_frequency: 'Monthly',
      availability: { MKT_A: 'Available', MKT_B: 'Not available', MKT_C: 'Not available' },
      data_age_days: { MKT_A: 15, MKT_B: null, MKT_C: null },
      used_by_dimensions: ['SEGMENT', 'POTENTIAL'],
    },
    {
      feature_id: 'FT-02',
      feature_name: 'brick_sales_qoq_change',
      description: 'Quarter-over-quarter % change in brick-level unit volume',
      source_category: 'Sales',
      granularity: 'BRICK',
      refresh_frequency: 'Monthly',
      availability: { MKT_A: 'Not available', MKT_B: 'Available', MKT_C: 'Not available' },
      data_age_days: { MKT_A: null, MKT_B: 14, MKT_C: null },
      used_by_dimensions: ['SEGMENT'],
    },
    {
      feature_id: 'FT-03',
      feature_name: 'account_sellin_annual_runrate',
      description: 'Quarterly account direct purchase and wholesaler sell-in trajectory',
      source_category: 'Sales',
      granularity: 'ACCOUNT',
      refresh_frequency: 'Quarterly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 30, MKT_B: 30, MKT_C: 45 },
      used_by_dimensions: ['ACC_POTENTIAL', 'SEGMENT'],
    },
    {
      feature_id: 'FT-04',
      feature_name: 'portal_visits_3m',
      description: 'Rolling 90-day portal authenticated session count',
      source_category: 'Digital',
      granularity: 'HCP',
      refresh_frequency: 'Daily',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Partial' },
      data_age_days: { MKT_A: 2, MKT_B: 3, MKT_C: 7 },
      used_by_dimensions: ['DIGITAL', 'CHANNEL_PREF'],
    },
    {
      feature_id: 'FT-05',
      feature_name: 'call_acceptance_rate',
      description: 'Ratio of completed calls to total scheduled planned rep interactions',
      source_category: 'CRM',
      granularity: 'HCP',
      refresh_frequency: 'Weekly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 3, MKT_B: 3, MKT_C: 5 },
      used_by_dimensions: ['ADOPTION', 'BEHAVIOURAL'],
    },
    {
      feature_id: 'FT-06',
      feature_name: 'pmr_attitudinal',
      description: 'Survey wave classification into adopter category',
      source_category: 'Survey',
      granularity: 'HCP',
      refresh_frequency: 'Bi-annual',
      availability: { MKT_A: 'Partial', MKT_B: 'Partial', MKT_C: 'Available' },
      data_age_days: { MKT_A: 20, MKT_B: 20, MKT_C: 20 },
      used_by_dimensions: ['ATTITUDINAL', 'BEHAVIOURAL'],
    },
    {
      feature_id: 'FT-07',
      feature_name: 'formulary_status',
      description: 'Current verified formulary coverage listing at primary account',
      source_category: 'Claims & access',
      granularity: 'ACCOUNT',
      refresh_frequency: 'Monthly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 7, MKT_B: 7, MKT_C: 14 },
      used_by_dimensions: ['ACCESS_STATUS', 'ACC_TIER', 'POTENTIAL'],
    },
    {
      feature_id: 'FT-08',
      feature_name: 'kol_influence_score',
      description: 'Composite academic publication, congress, and co-authorship score',
      source_category: 'Reference',
      granularity: 'HCP',
      refresh_frequency: 'Quarterly',
      availability: { MKT_A: 'Available', MKT_B: 'Partial', MKT_C: 'Partial' },
      data_age_days: { MKT_A: 45, MKT_B: 45, MKT_C: 60 },
      used_by_dimensions: ['MICRO_SEGMENT'],
    },
    {
      feature_id: 'FT-09',
      feature_name: 'rep_adoption_assessment',
      description: 'Structured qualitative adoption stage log from field notes',
      source_category: 'CRM',
      granularity: 'HCP',
      refresh_frequency: 'Daily',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 1, MKT_B: 1, MKT_C: 2 },
      used_by_dimensions: ['ADOPTION'],
    },
    {
      feature_id: 'FT-10',
      feature_name: 'email_open_rate_6m',
      description: 'Rep-sent and marketing email open rate over rolling 180 days',
      source_category: 'Digital',
      granularity: 'HCP',
      refresh_frequency: 'Weekly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Partial' },
      data_age_days: { MKT_A: 4, MKT_B: 4, MKT_C: 10 },
      used_by_dimensions: ['DIGITAL', 'CHANNEL_PREF'],
    },
    {
      feature_id: 'FT-11',
      feature_name: 'webinar_attendance_count',
      description: 'Count of medical education virtual events attended in last 12 months',
      source_category: 'Digital',
      granularity: 'HCP',
      refresh_frequency: 'Monthly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Partial' },
      data_age_days: { MKT_A: 12, MKT_B: 12, MKT_C: 20 },
      used_by_dimensions: ['DIGITAL', 'CHANNEL_PREF'],
    },
    {
      feature_id: 'FT-12',
      feature_name: 'nrx_share_of_market',
      description: 'Brand new-to-brand prescription volume share within therapy area',
      source_category: 'Sales',
      granularity: 'HCP',
      refresh_frequency: 'Monthly',
      availability: { MKT_A: 'Available', MKT_B: 'Not available', MKT_C: 'Not available' },
      data_age_days: { MKT_A: 15, MKT_B: null, MKT_C: null },
      used_by_dimensions: ['SEGMENT'],
    },
    {
      feature_id: 'FT-13',
      feature_name: 'account_bed_capacity',
      description: 'Hospital licensed inpatient bed count',
      source_category: 'Reference',
      granularity: 'ACCOUNT',
      refresh_frequency: 'Annual',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 120, MKT_B: 120, MKT_C: 120 },
      used_by_dimensions: ['ACC_POTENTIAL', 'ACC_ARCHETYPE'],
    },
    {
      feature_id: 'FT-14',
      feature_name: 'pmr_prescribe_intent',
      description: 'Likelihood to prescribe in next 6 months stated in PMR wave',
      source_category: 'Survey',
      granularity: 'HCP',
      refresh_frequency: 'Bi-annual',
      availability: { MKT_A: 'Partial', MKT_B: 'Partial', MKT_C: 'Available' },
      data_age_days: { MKT_A: 20, MKT_B: 20, MKT_C: 20 },
      used_by_dimensions: ['ADOPTION', 'POTENTIAL'],
    },
    {
      feature_id: 'FT-15',
      feature_name: 'field_sample_utilization',
      description: 'Total unit samples provided in last 180 days',
      source_category: 'CRM',
      granularity: 'HCP',
      refresh_frequency: 'Weekly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 5, MKT_B: 5, MKT_C: 7 },
      used_by_dimensions: ['ADOPTION'],
    },
    {
      feature_id: 'FT-16',
      feature_name: 'affiliation_network_breadth',
      description: 'Count of active hospital and clinic care network affiliations',
      source_category: 'Reference',
      granularity: 'HCP',
      refresh_frequency: 'Monthly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 10, MKT_B: 10, MKT_C: 15 },
      used_by_dimensions: ['MICRO_SEGMENT'],
    },
    {
      feature_id: 'FT-17',
      feature_name: 'claims_patient_count_ta',
      description: 'Diagnosed patient count in indication from medical claims',
      source_category: 'Claims & access',
      granularity: 'HCP',
      refresh_frequency: 'Quarterly',
      availability: { MKT_A: 'Available', MKT_B: 'Not available', MKT_C: 'Not available' },
      data_age_days: { MKT_A: 40, MKT_B: null, MKT_C: null },
      used_by_dimensions: ['POTENTIAL'],
    },
    {
      feature_id: 'FT-18',
      feature_name: 'f2f_meeting_cadence',
      description: 'Average days between face-to-face commercial discussions',
      source_category: 'CRM',
      granularity: 'HCP',
      refresh_frequency: 'Weekly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 3, MKT_B: 3, MKT_C: 6 },
      used_by_dimensions: ['CHANNEL_PREF'],
    },
    {
      feature_id: 'FT-19',
      feature_name: 'congress_presentation_flag',
      description: 'Abstract or keynote presentation at key national congress in last 2 years',
      source_category: 'Reference',
      granularity: 'HCP',
      refresh_frequency: 'Annual',
      availability: { MKT_A: 'Available', MKT_B: 'Partial', MKT_C: 'Not available' },
      data_age_days: { MKT_A: 90, MKT_B: 90, MKT_C: null },
      used_by_dimensions: ['MICRO_SEGMENT'],
    },
    {
      feature_id: 'FT-20',
      feature_name: 'digital_consent_state',
      description: 'Opt-in verification state across email and virtual interaction channels',
      source_category: 'CRM',
      granularity: 'HCP',
      refresh_frequency: 'Daily',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 1, MKT_B: 1, MKT_C: 1 },
      used_by_dimensions: ['DIGITAL', 'CHANNEL_PREF'],
    },
    {
      feature_id: 'FT-21',
      feature_name: 'protocol_compliance_index',
      description: 'Institutional adherence score to clinical pathway protocols',
      source_category: 'Claims & access',
      granularity: 'ACCOUNT',
      refresh_frequency: 'Quarterly',
      availability: { MKT_A: 'Available', MKT_B: 'Partial', MKT_C: 'Not available' },
      data_age_days: { MKT_A: 60, MKT_B: 60, MKT_C: null },
      used_by_dimensions: ['DECISION_MODEL'],
    },
    {
      feature_id: 'FT-22',
      feature_name: 'tender_win_rate',
      description: 'Hospital tender award success rate for current brand class',
      source_category: 'Sales',
      granularity: 'ACCOUNT',
      refresh_frequency: 'Bi-annual',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 75, MKT_B: 75, MKT_C: 90 },
      used_by_dimensions: ['ACC_TIER'],
    },
    {
      feature_id: 'FT-23',
      feature_name: 'specialist_infusion_chair_count',
      description: 'Dedicated infusion chairs for specialty biologic treatments',
      source_category: 'Reference',
      granularity: 'ACCOUNT',
      refresh_frequency: 'Annual',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 180, MKT_B: 180, MKT_C: 180 },
      used_by_dimensions: ['TREATMENT_CAP'],
    },
    {
      feature_id: 'FT-24',
      feature_name: 'rep_note_sentiment_trajectory',
      description: 'NLP sentiment direction from latest three interaction logs',
      source_category: 'CRM',
      granularity: 'HCP',
      refresh_frequency: 'Daily',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Available' },
      data_age_days: { MKT_A: 2, MKT_B: 2, MKT_C: 3 },
      used_by_dimensions: ['BEHAVIOURAL', 'ADOPTION'],
    },
    {
      feature_id: 'FT-25',
      feature_name: 'competitor_share_threat_index',
      description: 'Observed competitor switching rate in local territory',
      source_category: 'Sales',
      granularity: 'BRICK',
      refresh_frequency: 'Monthly',
      availability: { MKT_A: 'Available', MKT_B: 'Available', MKT_C: 'Partial' },
      data_age_days: { MKT_A: 25, MKT_B: 25, MKT_C: 50 },
      used_by_dimensions: ['SEGMENT'],
    },
  ];

  writeJsonFile('sales.json', sales);
  writeJsonFile('crm_activity.json', crmActivity);
  writeJsonFile('digital_engagement.json', digitalEngagement);
  writeJsonFile('pmr_responses.json', pmrResponses);
  writeJsonFile('formulary_status.json', formularyStatus);
  writeJsonFile('kol_influence.json', kolInfluence);
  writeJsonFile('rep_notes.json', repNotes);
  writeJsonFile('feature_store.json', featureStore);

  return {
    sales,
    crmActivity,
    digitalEngagement,
    pmrResponses,
    formularyStatus,
    kolInfluence,
    repNotes,
    featureStore,
  };
}
