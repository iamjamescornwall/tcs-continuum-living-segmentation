/**
 * Master Synthetic Data Generator for Continuum Demo (v2)
 * Seeded, deterministic, reproducible.
 * Invoked via: npm run data:generate
 */

import { GeneratorContext } from './utils';
import { generateReferenceData } from './generators/gen01_reference';
import { generateStandardsData } from './generators/gen02_standards';
import { generateMasterData } from './generators/gen03_master';
import { generateSignalsData } from './generators/gen04_signals';
import { generateSegmentationData } from './generators/gen05_segmentation';
import { generatePipelineData } from './generators/gen06_pipeline';
import { generateRecordsData } from './generators/gen07_records';
import { generateIntakeAndAiData } from './generators/gen08_intake_ai';
import { generateAggregatesData } from './generators/gen09_aggregates';

async function main() {
  console.log('==================================================');
  console.log('🚀 CONTINUUM SYNTHETIC DATA GENERATOR (SEED = 42)');
  console.log('==================================================\n');

  const ctx = new GeneratorContext(42);

  console.log('--- Phase 1: Reference and users (Prompt 1) ---');
  const { markets, brands, personas, users } = generateReferenceData();

  console.log('\n--- Phase 2: Standards and governance (Prompt 2) ---');
  const { dimensions, approvalRights, thresholds, stabilityPolicy, vocabularyMap } = generateStandardsData();

  console.log('\n--- Phase 3: Customer master (Prompt 3) ---');
  const { hcps, accounts, affiliations, consent } = generateMasterData(ctx, users);

  console.log('\n--- Phase 4: Signals (Prompt 4) ---');
  const {
    sales,
    crmActivity,
    digitalEngagement,
    pmrResponses,
    formularyStatus,
    kolInfluence,
    repNotes,
    featureStore,
  } = generateSignalsData(ctx, hcps, accounts, consent, brands);

  console.log('\n--- Phase 5: Segmentation (Prompt 5) ---');
  const { assignments, history, library, studioOutputs } = generateSegmentationData(ctx, hcps, accounts);

  console.log('\n--- Phase 6: Change pipeline (Prompt 6) ---');
  const { changeEvents, driftFlags, proposals } = generatePipelineData(ctx, hcps, accounts);

  console.log('\n--- Phase 7: Records and learning (Prompt 7) ---');
  const { auditLog, publishLog, downstreamImpact, recalibration } = generateRecordsData(ctx, proposals, library);

  console.log('\n--- Phase 8: Intake and AI cache (Prompt 8) ---');
  const { vendorRows, aiCache } = generateIntakeAndAiData(ctx, proposals, repNotes);

  console.log('\n--- Phase 9: Aggregates (Prompt 9) ---');
  const aggregates = generateAggregatesData();

  console.log('\n==================================================');
  console.log('📊 DATASET SUMMARY & ROW COUNTS');
  console.log('==================================================');
  const summary = [
    { File: 'markets.json', Rows: markets.length },
    { File: 'brands.json', Rows: brands.length },
    { File: 'personas.json', Rows: personas.length },
    { File: 'users.json', Rows: users.length },
    { File: 'dimensions.json', Rows: dimensions.length },
    { File: 'approval_rights.json', Rows: approvalRights.length },
    { File: 'thresholds.json', Rows: thresholds.length },
    { File: 'stability_policy.json', Rows: Object.keys(stabilityPolicy).length + ' (object)' },
    { File: 'vocabulary_map.json', Rows: vocabularyMap.length },
    { File: 'hcps.json', Rows: hcps.length },
    { File: 'accounts.json', Rows: accounts.length },
    { File: 'affiliations.json', Rows: affiliations.length },
    { File: 'consent.json', Rows: consent.length },
    { File: 'sales.json', Rows: sales.length },
    { File: 'crm_activity.json', Rows: crmActivity.length },
    { File: 'digital_engagement.json', Rows: digitalEngagement.length },
    { File: 'pmr_responses.json', Rows: pmrResponses.length },
    { File: 'formulary_status.json', Rows: formularyStatus.length },
    { File: 'kol_influence.json', Rows: kolInfluence.length },
    { File: 'rep_notes.json', Rows: repNotes.length },
    { File: 'feature_store.json', Rows: featureStore.length },
    { File: 'segment_assignments.json', Rows: assignments.length },
    { File: 'segment_history.json', Rows: history.length },
    { File: 'segment_library.json', Rows: library.length },
    { File: 'studio_outputs.json', Rows: studioOutputs.length },
    { File: 'change_events.json', Rows: changeEvents.length },
    { File: 'drift_flags.json', Rows: driftFlags.length },
    { File: 'proposals.json', Rows: proposals.length },
    { File: 'audit_log.json', Rows: auditLog.length },
    { File: 'publish_log.json', Rows: publishLog.length },
    { File: 'downstream_impact.json', Rows: downstreamImpact.length },
    { File: 'recalibration.json', Rows: recalibration.length },
    { File: 'vendor_file_mkt_c.json', Rows: vendorRows.length },
    { File: 'ai_cache.json', Rows: Object.keys(aiCache).length + ' tasks' },
    { File: 'aggregates.json', Rows: Object.keys(aggregates.markets).length + ' markets' },
  ];
  console.table(summary);

  console.log('\n🎯 HERO RECORDS VERIFICATION:');
  console.log(`- Hero HCP: ${hcps[600]?.display_name} (${hcps[600]?.hcp_id})`);
  console.log(`- Hero Account: ${accounts[120]?.name} (${accounts[120]?.hco_id})`);
  console.log(`- Hero Proposal: ${proposals[0]?.proposal_id} (${proposals[0]?.customer_id} ${proposals[0]?.dimension_code} ${proposals[0]?.current_value} → ${proposals[0]?.proposed_value})`);
  console.log('\n✅ All Prompts 1-9 generated successfully.');
}

main().catch((err) => {
  console.error('Fatal error during data generation:', err);
  process.exit(1);
});
