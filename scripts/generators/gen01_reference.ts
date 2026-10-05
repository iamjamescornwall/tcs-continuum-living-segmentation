/**
 * Prompt 1: Reference and users generator
 * Produces markets.json, brands.json, personas.json, users.json
 */

import { Market, Brand, Persona, User } from '../../src/types';
import { HERO_USERS } from '../heroes';
import { writeJsonFile } from '../utils';

export function generateReferenceData(): {
  markets: Market[];
  brands: Brand[];
  personas: Persona[];
  users: User[];
} {
  const markets: Market[] = [
    {
      market_code: 'MKT_A',
      display_name: 'Market A · Data-rich',
      maturity_level: 'Data-rich',
      profile: 'HCP-level Rx and claims, digital, KOL',
      current_process: 'In-house model, quarterly refresh',
      current_tool: 'In-house Python model',
      studio_method: 'KMEANS_RULES',
      refresh_cadence: 'Quarterly',
      refresh_cycles_per_year: 4,
      manual_hours_per_refresh: 120,
      vendor_dependent: false,
      on_global_standard: false,
      brands: ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'],
      hcp_universe: 8000,
      account_universe: 900,
      currency_note: 'Values shown in USD',
    },
    {
      market_code: 'MKT_B',
      display_name: 'Market B · Signal-enriched',
      maturity_level: 'Signal-enriched',
      profile: 'Brick-level sales, strong CRM, consented digital',
      current_process: 'Different tool, annual refresh, rep adjustments',
      current_tool: 'Third-party segmentation tool',
      studio_method: 'RULES_DECILE_CLUSTERS',
      refresh_cadence: 'Annual',
      refresh_cycles_per_year: 1,
      manual_hours_per_refresh: 260,
      vendor_dependent: false,
      on_global_standard: false,
      brands: ['AUR', 'ZEN', 'CRD', 'NEU', 'BRV'],
      hcp_universe: 4000,
      account_universe: 400,
      currency_note: 'Values shown in USD',
    },
    {
      market_code: 'MKT_C',
      display_name: 'Market C · Survey-led',
      maturity_level: 'Survey-led',
      profile: 'No HCP-level sales; PMR + CRM + rep input',
      current_process: 'Local agency Excel file yearly + rep judgement',
      current_tool: 'Agency Excel file',
      studio_method: 'RULES_TEMPLATE',
      refresh_cadence: 'Annual',
      refresh_cycles_per_year: 1,
      manual_hours_per_refresh: 340,
      vendor_dependent: true,
      on_global_standard: false,
      brands: ['AUR', 'ZEN', 'CRD'],
      hcp_universe: 1500,
      account_universe: 150,
      currency_note: 'Values shown in USD',
    },
  ];

  const brands: Brand[] = [
    {
      brand_code: 'AUR',
      brand_name: 'Aurelix',
      therapy_area: 'Immunology',
      lifecycle: 'Launch',
      launch_date: '2025-01-15',
      indications: [
        { indication_code: 'AUR_PSO', name: 'Plaque psoriasis' },
        { indication_code: 'AUR_PSA', name: 'Psoriatic arthritis' },
      ],
      markets: ['MKT_A', 'MKT_B', 'MKT_C'],
      key_specialties: ['Dermatology', 'Rheumatology'],
    },
    {
      brand_code: 'ZEN',
      brand_name: 'Zentrova',
      therapy_area: 'Oncology',
      lifecycle: 'Growth',
      launch_date: '2023-06-01',
      indications: [
        { indication_code: 'ZEN_NSCLC', name: 'NSCLC' },
        { indication_code: 'ZEN_HER2', name: 'HER2+ breast cancer' },
      ],
      markets: ['MKT_A', 'MKT_B', 'MKT_C'],
      key_specialties: ['Medical oncology', 'Thoracic oncology', 'Breast surgery'],
    },
    {
      brand_code: 'CRD',
      brand_name: 'Cardivance',
      therapy_area: 'Cardiometabolic',
      lifecycle: 'Mature',
      launch_date: '2018-03-10',
      indications: [
        { indication_code: 'CRD_HF', name: 'Heart failure' },
        { indication_code: 'CRD_CKD', name: 'CKD' },
      ],
      markets: ['MKT_A', 'MKT_B', 'MKT_C'],
      key_specialties: ['Cardiology', 'Nephrology', 'General practice'],
    },
    {
      brand_code: 'NEU',
      brand_name: 'Neurelle',
      therapy_area: 'Neuroscience',
      lifecycle: 'Growth',
      launch_date: '2024-02-20',
      indications: [
        { indication_code: 'NEU_MIG', name: 'Migraine prevention' },
        { indication_code: 'NEU_MS', name: 'Multiple sclerosis' },
      ],
      markets: ['MKT_A', 'MKT_B'],
      key_specialties: ['Neurology', 'Headache specialist'],
    },
    {
      brand_code: 'BRV',
      brand_name: 'Brevanta',
      therapy_area: 'Respiratory',
      lifecycle: 'Mature',
      launch_date: '2019-09-01',
      indications: [
        { indication_code: 'BRV_SA', name: 'Severe asthma' },
        { indication_code: 'BRV_COPD', name: 'COPD' },
      ],
      markets: ['MKT_A', 'MKT_B'],
      key_specialties: ['Pulmonology', 'Allergy', 'General practice'],
    },
  ];

  const personas: Persona[] = [
    {
      persona_id: 'P1',
      persona_name: 'Global Segmentation Lead',
      user_id: 'USR-001',
      market_scope: 'ALL',
      landing_screen: 'S03',
      visible_screens: [
        'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08',
        'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'D01', 'S15'
      ],
      label_overrides: {},
      can_approve_dimensions: [
        'SEGMENT', 'POTENTIAL', 'ADOPTION', 'BEHAVIOURAL', 'ATTITUDINAL',
        'DIGITAL', 'CHANNEL_PREF', 'MICRO_SEGMENT', 'ACC_ARCHETYPE',
        'ACC_POTENTIAL', 'ACCESS_STATUS', 'DECISION_MODEL', 'TREATMENT_CAP', 'ACC_TIER'
      ],
    },
    {
      persona_id: 'P2',
      persona_name: 'Market Back Office (Commercial Excellence)',
      user_id: 'USR-002',
      market_scope: 'MKT_B',
      landing_screen: 'S10',
      visible_screens: ['S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S04'],
      label_overrides: {},
      can_approve_dimensions: ['SEGMENT', 'POTENTIAL', 'MICRO_SEGMENT', 'BEHAVIOURAL', 'ATTITUDINAL'],
    },
    {
      persona_id: 'P3',
      persona_name: 'KAM / Account Lead',
      user_id: 'USR-005',
      market_scope: 'MKT_B',
      landing_screen: 'S10',
      visible_screens: ['S08', 'S09', 'S10', 'S11'],
      label_overrides: {},
      can_approve_dimensions: ['ACC_TIER', 'ACC_POTENTIAL', 'ACCESS_STATUS', 'ACC_ARCHETYPE', 'DECISION_MODEL', 'TREATMENT_CAP'],
    },
    {
      persona_id: 'P4',
      persona_name: 'Field Rep',
      user_id: 'USR-006',
      market_scope: 'MKT_B',
      landing_screen: 'S10',
      visible_screens: ['S10', 'D01'],
      label_overrides: { S10: 'My Customers' },
      can_approve_dimensions: ['ADOPTION', 'DIGITAL', 'CHANNEL_PREF'],
    },
    {
      persona_id: 'P5',
      persona_name: 'Local Agency (vendor)',
      user_id: 'USR-007',
      market_scope: 'MKT_C',
      landing_screen: 'S05',
      visible_screens: ['S05'],
      label_overrides: {},
      can_approve_dimensions: [],
    },
    {
      persona_id: 'P6',
      persona_name: 'Executive / Compliance',
      user_id: 'USR-008',
      market_scope: 'ALL',
      landing_screen: 'S01',
      visible_screens: ['S01', 'S02', 'S08', 'S12', 'S13', 'S14'],
      label_overrides: {},
      can_approve_dimensions: [],
    },
  ];

  // Users: start with 9 hero users
  const users: User[] = [...HERO_USERS];

  // Territories: A has 12 (TER-A-01..12), B has 8 (TER-B-01..08), C has 5 (TER-C-01..05)
  // USR-006 is rep for TER-B-03.
  const repNamesA = [
    'Alexander Wright', 'Claire Dubois', 'Marcus Brody', 'Helena Vance',
    'Liam Chen', 'Emma Ross', 'David Miller', 'Sophie Martin',
    'Oliver Scott', 'Chloe Bennett', 'Lucas Meyer', 'Zoe Fischer'
  ];
  repNamesA.forEach((name, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    users.push({
      user_id: `USR-${String(10 + idx).padStart(3, '0')}`,
      name,
      persona_id: 'P4',
      market_code: 'MKT_A',
      territory_id: `TER-A-${num}`,
      agency_name: null,
    });
  });

  const repNamesB = [
    'Benjamin Holt', 'Amara Patel', /* TER-B-03 is USR-006 */
    'Gabriel Silva', 'Ingrid Bergman', 'Matteo Rossi', 'Fatima Zahra', 'Lukas Novak'
  ];
  const bTerritories = ['TER-B-01', 'TER-B-02', 'TER-B-04', 'TER-B-05', 'TER-B-06', 'TER-B-07', 'TER-B-08'];
  repNamesB.forEach((name, idx) => {
    users.push({
      user_id: `USR-${String(22 + idx).padStart(3, '0')}`,
      name,
      persona_id: 'P4',
      market_code: 'MKT_B',
      territory_id: bTerritories[idx],
      agency_name: null,
    });
  });

  const repNamesC = [
    'Budi Wijaya', 'Siti Rahma', 'Aditya Pratama', 'Nurul Hidayah', 'Reza Gunawan'
  ];
  repNamesC.forEach((name, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    users.push({
      user_id: `USR-${String(29 + idx).padStart(3, '0')}`,
      name,
      persona_id: 'P4',
      market_code: 'MKT_C',
      territory_id: `TER-C-${num}`,
      agency_name: null,
    });
  });

  // Additional KAMs:
  // MKT_A KAMs
  users.push(
    { user_id: 'USR-034', name: 'Rachel Green', persona_id: 'P3', market_code: 'MKT_A', territory_id: null, agency_name: null },
    { user_id: 'USR-035', name: 'Nicholas Brody', persona_id: 'P3', market_code: 'MKT_A', territory_id: null, agency_name: null },
    { user_id: 'USR-036', name: 'Daniel Craig', persona_id: 'P3', market_code: 'MKT_A', territory_id: null, agency_name: null }
  );

  // MKT_B KAMs (USR-005 is hero KAM)
  users.push(
    { user_id: 'USR-037', name: 'Nadia Becker', persona_id: 'P3', market_code: 'MKT_B', territory_id: null, agency_name: null },
    { user_id: 'USR-038', name: 'Julian Santos', persona_id: 'P3', market_code: 'MKT_B', territory_id: null, agency_name: null }
  );

  // MKT_C KAMs
  users.push(
    { user_id: 'USR-039', name: 'Agus Salim', persona_id: 'P3', market_code: 'MKT_C', territory_id: null, agency_name: null },
    { user_id: 'USR-040', name: 'Rina Kusuma', persona_id: 'P3', market_code: 'MKT_C', territory_id: null, agency_name: null }
  );

  writeJsonFile('markets.json', markets);
  writeJsonFile('brands.json', brands);
  writeJsonFile('personas.json', personas);
  writeJsonFile('users.json', users);

  return { markets, brands, personas, users };
}
