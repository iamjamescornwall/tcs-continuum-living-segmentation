/**
 * Prompt 3: Customer master generator
 * Produces hcps.json, accounts.json, affiliations.json, consent.json
 */

import { HCP, Account, Affiliation, ConsentRecord, User } from '../../src/types';
import { HERO_ACCOUNT_B001, HERO_HCP_B0001 } from '../heroes';
import { GeneratorContext, writeJsonFile } from '../utils';

export function generateMasterData(
  ctx: GeneratorContext,
  users: User[]
): {
  hcps: HCP[];
  accounts: Account[];
  affiliations: Affiliation[];
  consent: ConsentRecord[];
} {
  // Accounts first so we can affiliate HCPs
  const accounts: Account[] = [];

  const accountArchetypes = [
    'Academic centre',
    'Community hospital',
    'Specialty clinic',
    'Integrated network',
    'Private practice group',
  ];
  const hcoTypes: Array<'Hospital' | 'Clinic' | 'IDN' | 'Specialty centre' | 'Pharmacy chain'> = [
    'Hospital', 'Clinic', 'IDN', 'Specialty centre',
  ];
  const procurementModels: Array<'Central tender' | 'Local formulary' | 'Direct purchase'> = [
    'Central tender', 'Local formulary', 'Direct purchase',
  ];
  const treatmentCaps = ['Full (infusion + specialist)', 'Partial', 'Referral only'];
  const decisionModels = ['Clinician-led', 'Committee-led', 'Protocol-driven', 'Procurement-led'];

  const regionsA = ['North East', 'North West', 'Central', 'South East', 'South West'];
  const regionsB = ['North', 'Central', 'South', 'West'];
  const regionsC = ['Metro East', 'Metro West', 'Island Coastal', 'Highlands'];

  const hospitalPrefixes = ['Mercy', 'St. Jude', 'Royal', 'Grand', 'Valley', 'Apex', 'Beacon', 'Highland', 'Summit', 'Trinity'];
  const hospitalSuffixes = ['Hospital', 'Medical Centre', 'Infirmary', 'Health Pavilion', 'Regional Hospital'];

  const kamUsersA = users.filter((u) => u.persona_id === 'P3' && u.market_code === 'MKT_A').map((u) => u.user_id);
  const kamUsersB = users.filter((u) => u.persona_id === 'P3' && u.market_code === 'MKT_B').map((u) => u.user_id);
  const kamUsersC = users.filter((u) => u.persona_id === 'P3' && u.market_code === 'MKT_C').map((u) => u.user_id);

  // Generate accounts for MKT_A (120)
  for (let i = 1; i <= 120; i++) {
    const id = `ACC-A-${String(i).padStart(3, '0')}`;
    const name = `${ctx.choice(hospitalPrefixes)} ${ctx.choice(hospitalSuffixes)} A-${i}`;
    const isTop20 = i <= 24;
    const volMultiplier = isTop20 ? ctx.randomFloat(2.5, 4.5) : ctx.randomFloat(0.5, 1.2);

    accounts.push({
      hco_id: id,
      market_code: 'MKT_A',
      name,
      archetype: ctx.choice(accountArchetypes),
      hco_type: ctx.choice(hcoTypes),
      region: ctx.choice(regionsA),
      urbanicity: ctx.weightedChoice(['Urban', 'Suburban', 'Rural'], [0.55, 0.30, 0.15]),
      beds: ctx.choice([150, 300, 500, 750, 1000]),
      annual_patient_volume_ta: {
        AUR: Math.round(ctx.randomInt(200, 600) * volMultiplier),
        ZEN: Math.round(ctx.randomInt(100, 400) * volMultiplier),
        CRD: Math.round(ctx.randomInt(600, 1500) * volMultiplier),
        NEU: Math.round(ctx.randomInt(150, 500) * volMultiplier),
        BRV: Math.round(ctx.randomInt(250, 700) * volMultiplier),
      },
      affiliated_hcp_count: 0, // Will compute from affiliations
      kam_user_id: ctx.choice(kamUsersA),
      procurement_model: ctx.choice(procurementModels),
      treatment_capability: ctx.choice(treatmentCaps),
      decision_model: ctx.choice(decisionModels),
    });
  }

  // Generate accounts for MKT_B (80), starting with ACC-B-001 hero
  accounts.push({ ...HERO_ACCOUNT_B001 });

  for (let i = 2; i <= 80; i++) {
    const id = `ACC-B-${String(i).padStart(3, '0')}`;
    const name = `${ctx.choice(hospitalPrefixes)} ${ctx.choice(hospitalSuffixes)} B-${i}`;
    const isTop20 = i <= 16;
    const volMultiplier = isTop20 ? ctx.randomFloat(2.5, 4.5) : ctx.randomFloat(0.5, 1.2);

    accounts.push({
      hco_id: id,
      market_code: 'MKT_B',
      name,
      archetype: ctx.choice(accountArchetypes),
      hco_type: ctx.choice(hcoTypes),
      region: ctx.choice(regionsB),
      urbanicity: ctx.weightedChoice(['Urban', 'Suburban', 'Rural'], [0.60, 0.25, 0.15]),
      beds: ctx.choice([120, 250, 450, 600]),
      annual_patient_volume_ta: {
        AUR: Math.round(ctx.randomInt(180, 500) * volMultiplier),
        ZEN: Math.round(ctx.randomInt(90, 350) * volMultiplier),
        CRD: Math.round(ctx.randomInt(500, 1300) * volMultiplier),
        NEU: Math.round(ctx.randomInt(120, 400) * volMultiplier),
        BRV: Math.round(ctx.randomInt(200, 600) * volMultiplier),
      },
      affiliated_hcp_count: 0,
      kam_user_id: ctx.choice(kamUsersB),
      procurement_model: ctx.choice(procurementModels),
      treatment_capability: ctx.choice(treatmentCaps),
      decision_model: ctx.choice(decisionModels),
    });
  }

  // Generate accounts for MKT_C (40)
  for (let i = 1; i <= 40; i++) {
    const id = `ACC-C-${String(i).padStart(3, '0')}`;
    const name = `${ctx.choice(hospitalPrefixes)} Clinic & Hospital C-${i}`;
    const isTop20 = i <= 8;
    const volMultiplier = isTop20 ? ctx.randomFloat(2.5, 4.5) : ctx.randomFloat(0.5, 1.2);

    accounts.push({
      hco_id: id,
      market_code: 'MKT_C',
      name,
      archetype: ctx.choice(accountArchetypes),
      hco_type: ctx.choice(hcoTypes),
      region: ctx.choice(regionsC),
      urbanicity: ctx.weightedChoice(['Urban', 'Suburban', 'Rural'], [0.70, 0.15, 0.15]),
      beds: ctx.choice([80, 150, 300]),
      annual_patient_volume_ta: {
        AUR: Math.round(ctx.randomInt(100, 300) * volMultiplier),
        ZEN: Math.round(ctx.randomInt(60, 200) * volMultiplier),
        CRD: Math.round(ctx.randomInt(300, 800) * volMultiplier),
        NEU: 0, // NEU not in C
        BRV: 0, // BRV not in C
      },
      affiliated_hcp_count: 0,
      kam_user_id: ctx.choice(kamUsersC),
      procurement_model: ctx.choice(procurementModels),
      treatment_capability: ctx.choice(treatmentCaps),
      decision_model: ctx.choice(decisionModels),
    });
  }

  // HCPs generation
  const hcps: HCP[] = [];

  const firstNamesF = ['Emma', 'Sarah', 'Rachel', 'Laura', 'Elena', 'Maria', 'Sophie', 'Anna', 'Grace', 'Maya', 'Julia', 'Clara'];
  const firstNamesM = ['James', 'David', 'Michael', 'Thomas', 'Daniel', 'Alexander', 'Mark', 'Peter', 'Simon', 'Julian', 'Lucas', 'Felix'];
  const lastNames = ['Müller', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun'];

  const allSpecialties = [
    'Dermatology', 'Rheumatology', 'Medical oncology', 'Thoracic oncology',
    'Breast surgery', 'Cardiology', 'Nephrology', 'Neurology',
    'Headache specialist', 'Pulmonology', 'Allergy', 'General practice'
  ];
  const specialtiesC = [
    'Dermatology', 'Rheumatology', 'Medical oncology', 'Thoracic oncology',
    'Breast surgery', 'Cardiology', 'Nephrology', 'General practice'
  ];

  const repTerritoriesA = users.filter((u) => u.persona_id === 'P4' && u.market_code === 'MKT_A');
  const repTerritoriesB = users.filter((u) => u.persona_id === 'P4' && u.market_code === 'MKT_B');
  const repTerritoriesC = users.filter((u) => u.persona_id === 'P4' && u.market_code === 'MKT_C');

  // MKT_A: 600 HCPs
  for (let i = 1; i <= 600; i++) {
    const id = `HCP-A-${String(i).padStart(4, '0')}`;
    const rep = ctx.choice(repTerritoriesA);
    const gender: 'F' | 'M' = ctx.rng() > 0.45 ? 'F' : 'M';
    const first = gender === 'F' ? ctx.choice(firstNamesF) : ctx.choice(firstNamesM);
    const last = ctx.choice(lastNames);

    // Hero HCPs in MKT_A
    if (i === 1) {
      // HCP-A-0001: freeze window hero
      hcps.push({
        hcp_id: id,
        market_code: 'MKT_A',
        first_name: 'Marcus',
        last_name: 'Berg',
        display_name: 'Dr. Marcus Berg',
        hcp_type: 'Specialist',
        specialty: 'Dermatology',
        years_in_practice: 16,
        gender: 'M',
        region: 'North East',
        urbanicity: 'Urban',
        practice_type: 'Hospital',
        territory_id: 'TER-A-01',
        brick_id: null,
        primary_hco_id: 'ACC-A-001',
        rep_user_id: 'USR-010',
        kol_flag: false,
        in_customer_master: true,
        created_date: '2023-02-10',
      });
      continue;
    }
    if (i === 2) {
      // HCP-A-0002: previously rejected hero
      hcps.push({
        hcp_id: id,
        market_code: 'MKT_A',
        first_name: 'Astrid',
        last_name: 'Lind',
        display_name: 'Dr. Astrid Lind',
        hcp_type: 'Specialist',
        specialty: 'Dermatology',
        years_in_practice: 11,
        gender: 'F',
        region: 'Central',
        urbanicity: 'Urban',
        practice_type: 'Private clinic',
        territory_id: 'TER-A-03',
        brick_id: null,
        primary_hco_id: 'ACC-A-005',
        rep_user_id: 'USR-012',
        kol_flag: false,
        in_customer_master: true,
        created_date: '2023-05-18',
      });
      continue;
    }
    if (i === 3) {
      // HCP-A-0003: K-means hero (cluster_2 -> Engaged / Segment A)
      hcps.push({
        hcp_id: id,
        market_code: 'MKT_A',
        first_name: 'Henrik',
        last_name: 'Holm',
        display_name: 'Dr. Henrik Holm',
        hcp_type: 'Specialist',
        specialty: 'Dermatology',
        years_in_practice: 19,
        gender: 'M',
        region: 'North West',
        urbanicity: 'Urban',
        practice_type: 'Hospital',
        territory_id: 'TER-A-02',
        brick_id: null,
        primary_hco_id: 'ACC-A-002',
        rep_user_id: 'USR-011',
        kol_flag: true,
        in_customer_master: true,
        created_date: '2022-11-04',
      });
      continue;
    }

    // HCP-A-0100 to HCP-A-0140: Rural GPs for Brevanta bias case
    const isRuralBiasGp = i >= 100 && i <= 140;
    const hcpType: 'Specialist' | 'GP' | 'NP/PA' = isRuralBiasGp
      ? 'GP'
      : ctx.weightedChoice(['Specialist', 'GP', 'NP/PA'], [0.55, 0.35, 0.10]);
    const specialty = isRuralBiasGp ? 'General practice' : (hcpType === 'GP' ? 'General practice' : ctx.choice(allSpecialties.filter(s => s !== 'General practice')));
    const urbanicity: 'Urban' | 'Suburban' | 'Rural' = isRuralBiasGp
      ? 'Rural'
      : ctx.weightedChoice(['Urban', 'Suburban', 'Rural'], [0.55, 0.30, 0.15]);

    const acc = ctx.choice(accounts.filter(a => a.market_code === 'MKT_A'));

    hcps.push({
      hcp_id: id,
      market_code: 'MKT_A',
      first_name: first,
      last_name: last,
      display_name: `Dr. ${first} ${last}`,
      hcp_type: hcpType,
      specialty,
      years_in_practice: ctx.randomInt(3, 38),
      gender,
      region: ctx.choice(regionsA),
      urbanicity,
      practice_type: ctx.choice(['Hospital', 'Private clinic', 'Group practice', 'Academic']),
      territory_id: rep.territory_id || 'TER-A-01',
      brick_id: null,
      primary_hco_id: acc.hco_id,
      rep_user_id: rep.user_id,
      kol_flag: ctx.rng() < 0.05,
      in_customer_master: true,
      created_date: '2023-01-10',
    });
  }

  // MKT_B: 400 HCPs
  // 1: Hero HCP-B-0001
  hcps.push({ ...HERO_HCP_B0001 });

  // 2..6: Oncology heroes affiliated to ACC-B-001 (Zentrova propagation)
  const oncoHeroes = [
    { id: 'HCP-B-0002', name: 'Dr. Evelyn Brand', gender: 'F' as const, specialty: 'Medical oncology' },
    { id: 'HCP-B-0003', name: 'Dr. Viktor Krause', gender: 'M' as const, specialty: 'Thoracic oncology' },
    { id: 'HCP-B-0004', name: 'Dr. Anja Richter', gender: 'F' as const, specialty: 'Breast surgery' },
    { id: 'HCP-B-0005', name: 'Dr. Stefan Wolf', gender: 'M' as const, specialty: 'Medical oncology' },
    { id: 'HCP-B-0006', name: 'Dr. Florian Schulz', gender: 'M' as const, specialty: 'Thoracic oncology' },
  ];
  for (const h of oncoHeroes) {
    const parts = h.name.replace('Dr. ', '').split(' ');
    hcps.push({
      hcp_id: h.id,
      market_code: 'MKT_B',
      first_name: parts[0],
      last_name: parts[1],
      display_name: h.name,
      hcp_type: 'Specialist',
      specialty: h.specialty,
      years_in_practice: ctx.randomInt(8, 25),
      gender: h.gender,
      region: 'North',
      urbanicity: 'Urban',
      practice_type: 'Hospital',
      territory_id: 'TER-B-03',
      brick_id: 'BRK-B-014',
      primary_hco_id: 'ACC-B-001',
      rep_user_id: 'USR-006',
      kol_flag: h.id === 'HCP-B-0002',
      in_customer_master: true,
      created_date: '2023-03-01',
    });
  }

  // 7: Hero conflicting signals case (HCP-B-0007)
  hcps.push({
    hcp_id: 'HCP-B-0007',
    market_code: 'MKT_B',
    first_name: 'Kristian',
    last_name: 'Baumann',
    display_name: 'Dr. Kristian Baumann',
    hcp_type: 'Specialist',
    specialty: 'Dermatology',
    years_in_practice: 12,
    gender: 'M',
    region: 'North',
    urbanicity: 'Urban',
    practice_type: 'Private clinic',
    territory_id: 'TER-B-03',
    brick_id: 'BRK-B-014',
    primary_hco_id: 'ACC-B-001',
    rep_user_id: 'USR-006',
    kol_flag: false,
    in_customer_master: true,
    created_date: '2023-04-12',
  });

  // 10: Hero Cardivance small change (HCP-B-0010)
  // 20: Hero Neurelle digital case (HCP-B-0020)
  for (let i = 8; i <= 400; i++) {
    const id = `HCP-B-${String(i).padStart(4, '0')}`;
    const rep = ctx.choice(repTerritoriesB);
    const gender: 'F' | 'M' = ctx.rng() > 0.45 ? 'F' : 'M';
    const first = gender === 'F' ? ctx.choice(firstNamesF) : ctx.choice(firstNamesM);
    const last = ctx.choice(lastNames);
    const brickNum = String(ctx.randomInt(1, 60)).padStart(3, '0');

    if (i === 10) {
      hcps.push({
        hcp_id: id,
        market_code: 'MKT_B',
        first_name: 'Matthias',
        last_name: 'Kern',
        display_name: 'Dr. Matthias Kern',
        hcp_type: 'Specialist',
        specialty: 'Cardiology',
        years_in_practice: 22,
        gender: 'M',
        region: 'Central',
        urbanicity: 'Suburban',
        practice_type: 'Hospital',
        territory_id: 'TER-B-02',
        brick_id: 'BRK-B-020',
        primary_hco_id: 'ACC-B-002',
        rep_user_id: 'USR-022',
        kol_flag: false,
        in_customer_master: true,
        created_date: '2022-09-15',
      });
      continue;
    }

    if (i === 20) {
      hcps.push({
        hcp_id: id,
        market_code: 'MKT_B',
        first_name: 'Sonja',
        last_name: 'Lenz',
        display_name: 'Dr. Sonja Lenz',
        hcp_type: 'Specialist',
        specialty: 'Neurology',
        years_in_practice: 10,
        gender: 'F',
        region: 'South',
        urbanicity: 'Urban',
        practice_type: 'Hospital',
        territory_id: 'TER-B-04',
        brick_id: 'BRK-B-035',
        primary_hco_id: 'ACC-B-004',
        rep_user_id: 'USR-023',
        kol_flag: false,
        in_customer_master: true,
        created_date: '2024-01-20',
      });
      continue;
    }

    const hcpType: 'Specialist' | 'GP' | 'NP/PA' = ctx.weightedChoice(
      ['Specialist', 'GP', 'NP/PA'],
      [0.55, 0.35, 0.10]
    );
    const specialty = hcpType === 'GP' ? 'General practice' : ctx.choice(allSpecialties.filter(s => s !== 'General practice'));
    const acc = ctx.choice(accounts.filter(a => a.market_code === 'MKT_B'));

    hcps.push({
      hcp_id: id,
      market_code: 'MKT_B',
      first_name: first,
      last_name: last,
      display_name: `Dr. ${first} ${last}`,
      hcp_type: hcpType,
      specialty,
      years_in_practice: ctx.randomInt(3, 35),
      gender,
      region: ctx.choice(regionsB),
      urbanicity: ctx.weightedChoice(['Urban', 'Suburban', 'Rural'], [0.60, 0.25, 0.15]),
      practice_type: ctx.choice(['Hospital', 'Private clinic', 'Group practice', 'Academic']),
      territory_id: rep.territory_id || 'TER-B-01',
      brick_id: `BRK-B-${brickNum}`,
      primary_hco_id: acc.hco_id,
      rep_user_id: rep.user_id,
      kol_flag: ctx.rng() < 0.05,
      in_customer_master: true,
      created_date: '2023-01-20',
    });
  }

  // MKT_C: 250 HCPs (no NP/PA)
  for (let i = 1; i <= 250; i++) {
    const id = `HCP-C-${String(i).padStart(4, '0')}`;
    const rep = ctx.choice(repTerritoriesC);
    const gender: 'F' | 'M' = ctx.rng() > 0.45 ? 'F' : 'M';
    const first = gender === 'F' ? ctx.choice(firstNamesF) : ctx.choice(firstNamesM);
    const last = ctx.choice(lastNames);

    if (i === 1) {
      // HCP-C-0001: hero survey-led loop case
      hcps.push({
        hcp_id: id,
        market_code: 'MKT_C',
        first_name: 'Bambang',
        last_name: 'Suharto',
        display_name: 'Dr. Bambang Suharto',
        hcp_type: 'Specialist',
        specialty: 'Dermatology',
        years_in_practice: 18,
        gender: 'M',
        region: 'Metro East',
        urbanicity: 'Urban',
        practice_type: 'Hospital',
        territory_id: 'TER-C-01',
        brick_id: null,
        primary_hco_id: 'ACC-C-001',
        rep_user_id: 'USR-029',
        kol_flag: true,
        in_customer_master: true,
        created_date: '2023-06-15',
      });
      continue;
    }

    const hcpType: 'Specialist' | 'GP' | 'NP/PA' = ctx.weightedChoice(
      ['Specialist', 'GP'],
      [0.65, 0.35]
    );
    const specialty = hcpType === 'GP' ? 'General practice' : ctx.choice(specialtiesC.filter(s => s !== 'General practice'));
    const acc = ctx.choice(accounts.filter(a => a.market_code === 'MKT_C'));

    hcps.push({
      hcp_id: id,
      market_code: 'MKT_C',
      first_name: first,
      last_name: last,
      display_name: `Dr. ${first} ${last}`,
      hcp_type: hcpType,
      specialty,
      years_in_practice: ctx.randomInt(4, 36),
      gender,
      region: ctx.choice(regionsC),
      urbanicity: ctx.weightedChoice(['Urban', 'Suburban', 'Rural'], [0.70, 0.15, 0.15]),
      practice_type: ctx.choice(['Hospital', 'Private clinic', 'Group practice']),
      territory_id: rep.territory_id || 'TER-C-01',
      brick_id: null,
      primary_hco_id: acc.hco_id,
      rep_user_id: rep.user_id,
      kol_flag: i <= 8, // exactly 8 local experts with KOL flag in MKT_C
      in_customer_master: true,
      created_date: '2023-07-01',
    });
  }

  // Affiliations generation
  const affiliations: Affiliation[] = [];
  const accountHcpCounts: Record<string, number> = {};

  for (const hcp of hcps) {
    // Primary affiliation
    const primaryHcoId = hcp.primary_hco_id || accounts.find(a => a.market_code === hcp.market_code)!.hco_id;
    accountHcpCounts[primaryHcoId] = (accountHcpCounts[primaryHcoId] || 0) + 1;

    // Does HCP have secondary affiliations?
    const hasSecondary = ctx.rng() < 0.45;
    if (!hasSecondary) {
      affiliations.push({
        hcp_id: hcp.hcp_id,
        hco_id: primaryHcoId,
        market_code: hcp.market_code,
        affiliation_type: 'Primary',
        weight: 1.0,
        start_date: '2024-01-01',
      });
    } else {
      const primaryWeight = ctx.round(ctx.randomFloat(0.65, 0.85), 2);
      const secondaryWeight = ctx.round(1.0 - primaryWeight, 2);

      affiliations.push({
        hcp_id: hcp.hcp_id,
        hco_id: primaryHcoId,
        market_code: hcp.market_code,
        affiliation_type: 'Primary',
        weight: primaryWeight,
        start_date: '2024-01-01',
      });

      // Pick a secondary account in the same market
      const sameMarketAccounts = accounts.filter(
        (a) => a.market_code === hcp.market_code && a.hco_id !== primaryHcoId
      );
      if (sameMarketAccounts.length > 0) {
        const secondaryHco = ctx.choice(sameMarketAccounts);
        accountHcpCounts[secondaryHco.hco_id] = (accountHcpCounts[secondaryHco.hco_id] || 0) + 1;

        affiliations.push({
          hcp_id: hcp.hcp_id,
          hco_id: secondaryHco.hco_id,
          market_code: hcp.market_code,
          affiliation_type: 'Secondary',
          weight: secondaryWeight,
          start_date: '2024-06-01',
        });
      }
    }
  }

  // Update affiliated_hcp_count on accounts
  for (const acc of accounts) {
    if (acc.hco_id === 'ACC-B-001') {
      acc.affiliated_hcp_count = 6; // Exactly 6 for hero account
    } else {
      acc.affiliated_hcp_count = accountHcpCounts[acc.hco_id] || 0;
    }
  }

  // Consent records generation
  // Email granted: A 72%, B 64%, C 18%
  const channels: Array<'Email' | 'Portal' | 'Remote' | 'Events' | 'Face-to-face'> = [
    'Email', 'Portal', 'Remote', 'Events', 'Face-to-face'
  ];
  const consent: ConsentRecord[] = [];

  for (const hcp of hcps) {
    const isHero = hcp.hcp_id === 'HCP-B-0001';

    for (const channel of channels) {
      let status: 'Granted' | 'Withdrawn' | 'Not captured' = 'Granted';

      if (isHero) {
        status = 'Granted';
      } else if (channel === 'Email') {
        const rate = hcp.market_code === 'MKT_A' ? 0.72 : (hcp.market_code === 'MKT_B' ? 0.64 : 0.18);
        status = ctx.rng() < rate ? 'Granted' : (ctx.rng() < 0.5 ? 'Withdrawn' : 'Not captured');
      } else if (channel === 'Portal') {
        const rate = hcp.market_code === 'MKT_A' ? 0.68 : (hcp.market_code === 'MKT_B' ? 0.55 : 0.22);
        status = ctx.rng() < rate ? 'Granted' : 'Not captured';
      } else if (channel === 'Remote') {
        const rate = hcp.market_code === 'MKT_A' ? 0.80 : 0.65;
        status = ctx.rng() < rate ? 'Granted' : 'Not captured';
      } else {
        status = ctx.rng() < 0.88 ? 'Granted' : 'Not captured';
      }

      consent.push({
        hcp_id: hcp.hcp_id,
        market_code: hcp.market_code,
        channel,
        consent_status: status,
        updated_date: '2026-03-15',
      });
    }
  }

  writeJsonFile('hcps.json', hcps);
  writeJsonFile('accounts.json', accounts);
  writeJsonFile('affiliations.json', affiliations);
  writeJsonFile('consent.json', consent);

  return { hcps, accounts, affiliations, consent };
}
