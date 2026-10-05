/**
 * Prompt 8: Vendor file and AI cache generator
 * Produces vendor_file_mkt_c.json, vendor_file_mkt_c.xlsx, ai_cache.json
 */

import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { Proposal, RepNote } from '../../src/types';
import { GeneratorContext, writeJsonFile, DATA_DIR } from '../utils';

export function generateIntakeAndAiData(
  ctx: GeneratorContext,
  proposals: Proposal[],
  repNotes: RepNote[]
): {
  vendorRows: any[];
  aiCache: Record<string, any>;
} {
  // 1. vendor_file_mkt_c.json & .xlsx
  // 260 rows from "Northbay Field Research"
  // 240 matched, 20 unmatched (18 missing ID, 11 not in master - some overlap with missing ID/typos)
  // 9 duplicates
  // Match rate: 240/260 = 92.3%
  const vendorRows: any[] = [];

  const specs = ['Dermatology', 'Dermatology', 'Rheumatology', 'General Practice', 'Cardiology'];
  const cities = ['East Port', 'Central Metro', 'West Bay', 'Highland Valley'];
  const clinics = ['City Central Clinic', 'Eastbay Medical Practice', 'St. Luke Center', 'Regional Health Post'];
  const remarks = [
    'Annual review complete',
    'Follow up scheduled for next quarter',
    'Receptive to portal education materials',
    'Prefers face-to-face visits when samples available',
    'High patient flow in morning clinic',
    'Key prescriber in district',
  ];

  for (let i = 1; i <= 260; i++) {
    let refNo: string | null = `HCP-C-${String(i).padStart(4, '0')}`;
    let drName = `Dr. Customer C-${i}`;
    let spec = ctx.choice(specs);
    const clinic = ctx.choice(clinics);
    const city = ctx.choice(cities);

    // Deliberate issues:
    // 18 rows with missing customer ID
    if (i >= 243) {
      refNo = null;
    }
    // 11 HCPs not in customer master (e.g. invalid IDs beyond 250 or ghost IDs)
    if (i >= 232 && i <= 242) {
      refNo = `HCP-C-${String(900 + i).padStart(4, '0')}`;
    }
    // 12 typos in name/specialty
    if (i >= 50 && i <= 61) {
      spec = 'Dermatolgy (Typo)';
      drName = `Dr. Customr C-${i}`;
    }
    // 9 duplicates (repeat an earlier row)
    if (i >= 200 && i <= 208) {
      refNo = `HCP-C-${String(i - 100).padStart(4, '0')}`;
      drName = `Dr. Customer C-${i - 100}`;
    }

    const pot = ctx.weightedChoice(['High', 'Med', 'Low'], [0.25, 0.45, 0.30]);
    const seg = ctx.weightedChoice(['Gold', 'Silver', 'Bronze'], [0.20, 0.50, 0.30]);
    const adopt = ctx.weightedChoice(['Aware', 'Trying', 'Using', 'Loyal'], [0.15, 0.30, 0.35, 0.20]);
    const lastVisit = `2026-0${ctx.randomInt(1, 9)}-${String(ctx.randomInt(10, 28)).padStart(2, '0')}`;

    vendorRows.push({
      Ref_No: refNo,
      Dr_Name: drName,
      Spec: spec,
      Clinic: clinic,
      City: city,
      Pot_Class: pot,
      Segmen: seg,
      Adopt: adopt,
      Last_Visit: lastVisit,
      Remarks: ctx.choice(remarks),
    });
  }

  writeJsonFile('vendor_file_mkt_c.json', vendorRows);

  // Write xlsx using SheetJS
  const ws = XLSX.utils.json_to_sheet(vendorRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Market_C_Segmentation');
  const xlsxPath = path.join(DATA_DIR, 'vendor_file_mkt_c.xlsx');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  fs.writeFileSync(xlsxPath, buf);
  console.log(`✓ Wrote vendor_file_mkt_c.xlsx (260 rows)`);

  // 2. ai_cache.json
  const aiCache: Record<string, any> = {
    'AI-1': {
      vendor_mkt_c_v1: {
        column_mappings: [
          { source_column: 'Ref_No', global_field: 'hcp_id', confidence: 'High' },
          { source_column: 'Dr_Name', global_field: 'display_name', confidence: 'High' },
          { source_column: 'Spec', global_field: 'specialty', confidence: 'High' },
          { source_column: 'Clinic', global_field: 'practice_name', confidence: 'Medium' },
          { source_column: 'City', global_field: 'region', confidence: 'Medium' },
          { source_column: 'Pot_Class', global_field: 'POTENTIAL', confidence: 'High' },
          { source_column: 'Segmen', global_field: 'SEGMENT', confidence: 'High' },
          { source_column: 'Adopt', global_field: 'ADOPTION', confidence: 'High' },
          { source_column: 'Last_Visit', global_field: 'last_interaction_date', confidence: 'High' },
        ],
        value_maps: {
          Pot_Class: { High: '4', Med: '3', Low: '2' },
          Segmen: { Gold: 'A', Silver: 'B', Bronze: 'C' },
          Adopt: { Aware: 'Aware', Trying: 'Trial', Using: 'Adoption', Loyal: 'Expansion' },
        },
        confidence: { overall: 'High', match_rate: 0.923, conformance: 0.88 },
      },
    },
    'AI-2': {
      'VER-0001': [
        {
          cluster_id: 'cluster_0',
          name: 'Traditional Low Prescribers',
          description: 'Low TRx volume with negative trend; minimal portal or digital interaction.',
          global_value: 'E',
        },
        {
          cluster_id: 'cluster_1',
          name: 'Pragmatist Core Maintainers',
          description: 'Steady volume with flat quarterly growth; standard face-to-face cadence.',
          global_value: 'D',
        },
        {
          cluster_id: 'cluster_2',
          name: 'Engaged Biologic Champions',
          description: 'High prescription growth (+28% QoQ) and intensive portal engagement (8+ sessions/mo).',
          global_value: 'A',
        },
        {
          cluster_id: 'cluster_3',
          name: 'Expanding Specialty Adopters',
          description: 'Positive growth trajectory with increasing self-serve digital queries.',
          global_value: 'B',
        },
        {
          cluster_id: 'cluster_4',
          name: 'Moderate Trialists',
          description: 'Moderate volume base with occasional patient initiations and web inquiry.',
          global_value: 'C',
        },
      ],
      'VER-0005': [
        {
          cluster_id: 'grid_tier_1',
          name: 'Top Potential Survey Champions',
          description: 'High volume proxy and high stated prescribe intent from latest wave.',
          global_value: 'A',
        },
        {
          cluster_id: 'grid_tier_2',
          name: 'Moderate Regional Base',
          description: 'Medium volume and consistent rep assessment.',
          global_value: 'B',
        },
      ],
    },
    'AI-3': {},
    'AI-4': {
      'Which market has the oldest segments?': {
        answer: 'Market C has the oldest segments with a median age of 330 days, where 81% of customer segment assignments are older than 180 days due to reliance on an annual agency spreadsheet refresh.',
        table: [
          { Market: 'Market A', 'Median Age': '70 days', 'Stale (>180d)': '12%' },
          { Market: 'Market B', 'Median Age': '210 days', 'Stale (>180d)': '58%' },
          { Market: 'Market C', 'Median Age': '330 days', 'Stale (>180d)': '81%' },
        ],
        link: '/health',
      },
      'Which segments are older than 9 months?': {
        answer: 'Segments older than 270 days are concentrated primarily in Market C (64% of universe) and Market B (31% of universe), representing customers who have not had a verified review since late 2025.',
        link: '/health',
      },
      'Why is Dr. Hanna Vogel proposed to move to Segment A?': {
        answer: 'Dr. Hanna Vogel (HCP-B-0001) is proposed for Segment A driven by four independent concordant signals: +12% QoQ brick volume (BRK-B-014), portal visits doubling from 3 to 6/month, shift to Early Adopter in PMR Wave 2026-W2, and rep note confirming 4 new patient starts.',
        table: [
          { Signal: 'Brick Sales', Value: '+12% QoQ', Source: 'Sales' },
          { Signal: 'Portal Visits', Value: '3 → 6/mo', Source: 'Digital' },
          { Signal: 'PMR Wave', Value: 'Early Adopter', Source: 'Survey' },
          { Signal: 'Rep Note', Value: '4 patient starts', Source: 'CRM' },
        ],
        link: '/review-queue',
      },
      'Which proposals are on hold, and why?': {
        answer: 'There are currently 41 proposals held across markets under stability policy rules: conflicting signal divergence (e.g. sample trial noted for HCP-B-0007), territory freeze windows in Market A (Q4 incentive period), and rapid re-segmentation limits.',
        link: '/review-queue',
      },
      'What changed at St. Aldric University Hospital?': {
        answer: 'St. Aldric University Hospital (ACC-B-001) was awarded an unrestricted formulary listing for Zentrova on 2026-10-08 following regional tender outcome, triggering account tier elevation to Tier 1 and propagation proposals for 5 affiliated oncologists.',
        link: '/change-monitor',
      },
      'How many unapproved write-backs are there?': {
        answer: 'There are 0 unapproved write-backs. Continuum enforces a strict human-in-the-loop gate: no model, agent, or automated process can update a CRM segment field without verified owner sign-off.',
        link: '/audit',
      },
      'Which markets are on the global standard?': {
        answer: 'Market A and Market B operate on the global standard vocabulary. Market C is currently being onboarded via Data Intake to map local agency nomenclature into the global taxonomy.',
        link: '/health',
      },
      'Is Market C\'s data ready?': {
        answer: 'Market C has high survey and rep note coverage but lacks HCP-level Rx sales. The platform uses proxy variables (account sell-in, PMR intent, and rep potential assessment) with explicit gap-filled indicators.',
        link: '/market-data',
      },
      'Where is the biggest opportunity gap for Aurelix?': {
        answer: 'The greatest opportunity gap lies in high-potential HCPs (Potential 3 and 4) who remain in Consideration or Trial adoption stages, representing 142 prescribers across Market A and B.',
        link: '/insights',
      },
      'What are the top rejection reasons?': {
        answer: 'The leading reason for proposal rejection is "Temporary behaviour" (38% of rejections in Market A), where short-term prescription surges or sample trials do not reflect sustained clinical practice.',
        link: '/audit',
      },
      'Is any group under-represented in Segment A?': {
        answer: 'Yes, responsible AI monitoring flags that rural General Practitioners in Market A are under-represented in Brevanta Segment A (representation index 0.62 vs parity 1.0), triggering a clinical review alert.',
        link: '/responsible-ai',
      },
      'What is living segmentation worth?': {
        answer: 'The value model estimates $1.64M annualised benefit across four levers: earlier capture of rising prescribers ($680k), avoided declining visits ($450k), higher rep plan adherence ($310k), and reduced analyst refresh hours ($200k).',
        link: '/value-calculator',
      },
    },
    'AI-5': {},
  };

  // Populate AI-3 for all proposals
  proposals.forEach((p) => {
    const driverSummary = p.drivers.map((d) => `${d.label}: ${d.value}`).join('; ');
    aiCache['AI-3'][p.explanation_key] = {
      headline: `Proposed ${p.dimension_code} change from ${p.current_value} to ${p.proposed_value} based on ${p.drivers.length} verified signals.`,
      drivers: p.drivers.map((d) => ({
        label: d.label,
        value: d.value,
        direction: 'Up',
        source_category: d.source_category,
        data_age_days: d.data_age_days,
      })),
      confidence: p.confidence,
      data_age: `${Math.min(...p.drivers.map((d) => d.data_age_days))} days`,
      what_would_move_next: `Sustained trend over next 60 days or shift in secondary channel engagement. ${driverSummary.slice(0, 80)}`,
    };
  });

  // Populate AI-5 for all 40 extracted rep notes
  const extractedNotes = repNotes.filter((n) => n.ai_extracted);
  extractedNotes.forEach((note) => {
    aiCache['AI-5'][note.note_id] = {
      signals: note.extracted_signals,
    };
  });

  writeJsonFile('ai_cache.json', aiCache);

  return { vendorRows, aiCache };
}
