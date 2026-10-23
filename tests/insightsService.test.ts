import { useAppStore } from '../src/store/useAppStore';
import dataService from '../src/services/dataService';
import {
  buildCustomerViews,
  computeProfiles,
  computeOpportunity,
  computeMigration,
  computeCrossMarket,
  computeChannelAffinity,
  computeTargeting,
  computeAccountRows,
} from '../src/services/insightsService';

function runInsightsTests() {
  console.log('--- RUNNING SEGMENT INSIGHTS DERIVATION TESTS (S08) ---');
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

  useAppStore.getState().resetDemo();
  const scopeB = { market: 'MKT_B' as const, brand: 'AUR' as const };
  const proposals = () => useAppStore.getState().proposals;

  // 1. Profiles scale the sample to the universe
  const viewsB = buildCustomerViews(scopeB, proposals());
  const profilesB = computeProfiles(viewsB);
  const shareSum = profilesB.reduce((acc, p) => acc + p.share, 0);
  const countSum = profilesB.reduce((acc, p) => acc + p.count, 0);
  const universeB = dataService.getAggregates('MKT_B').hcp_universe;
  assert(Math.abs(shareSum - 1) < 0.001, 'Segment shares sum to 100%');
  assert(Math.abs(countSum - universeB) <= 5, `Scaled segment counts sum to the Market B universe (${countSum} ≈ ${universeB})`);
  assert(profilesB.every((p) => p.avgPotential === 0 || (p.avgPotential >= 1 && p.avgPotential <= 4)), 'Average potential stays within 1–4');

  // 2. Opportunity gap follows DATA_SPEC (Potential 3–4, Adoption ≤ Consideration)
  const opp = computeOpportunity(viewsB, scopeB);
  const gapFromCells = opp.cells.filter((c) => c.isOpportunityGap).reduce((acc, c) => acc + c.count, 0);
  assert(Math.abs(gapFromCells - opp.gapCount) <= 4, 'Gap KPI matches the highlighted matrix cells');
  assert(opp.gapUncontacted <= opp.gapCount && opp.gapAtListedAccounts <= opp.gapCount, 'Gap sub-counts never exceed the gap');

  // 3. Brands absent from a market produce empty, not fabricated, insights
  const neuC = computeProfiles(buildCustomerViews({ market: 'MKT_C', brand: 'NEU' }, proposals()));
  assert(neuC.every((p) => p.count === 0), 'Neurelle in Market C yields no segment counts');
  assert(computeCrossMarket('NEU', proposals()).find((m) => m.market === 'MKT_C')?.available === false, 'Cross-market marks Neurelle/Market C unavailable');

  // 4. Written-back values outside the global vocabulary are never applied
  const allowedAdoption = dataService.getDimensions().find((d) => d.dimension_code === 'ADOPTION')!.allowed_values;
  assert(
    buildCustomerViews({ market: 'ALL', brand: 'AUR' }, proposals()).every((v) => !v.current.ADOPTION || allowedAdoption.includes(v.current.ADOPTION)),
    'No adoption value outside the global vocabulary after overlay'
  );

  // 5. Publishing the hero proposal moves the insights
  const before = {
    a: profilesB.find((p) => p.code === 'A')!.count,
    upgraded: computeMigration(viewsB).upgraded,
    recA: computeTargeting(viewsB, scopeB).rows[0].recommendedCalls,
  };
  const hero = proposals().find((p) => p.proposal_id === 'PRP-000001')!;
  useAppStore.getState().approveProposal(hero.proposal_id, 'P2', 'Field evidence verified');
  useAppStore.getState().publishToCrm('MKT_B', undefined, { brandCode: 'AUR', proposalIds: [hero.proposal_id] });

  const viewsAfter = buildCustomerViews(scopeB, proposals());
  const heroView = viewsAfter.find((v) => v.customerId === 'HCP-B-0001');
  assert(heroView?.current.SEGMENT === 'A' && heroView?.base.SEGMENT === 'B', 'Hero HCP is B → A after publish');
  assert(computeProfiles(viewsAfter).find((p) => p.code === 'A')!.count > before.a, 'Segment A estimated count rises after publish');
  assert(computeMigration(viewsAfter).upgraded > before.upgraded, 'Migration upgrades rise after publish');
  assert(computeTargeting(viewsAfter, scopeB).rows[0].recommendedCalls >= before.recA, 'Recommended Segment A calls do not fall after publish');

  // 6. Channel affinity and accounts are well-formed
  const affinity = computeChannelAffinity(viewsAfter, scopeB);
  assert(affinity.length === 25 && affinity.every((c) => c.reachPct >= 0 && c.reachPct <= 100), 'Channel affinity is a 5×5 grid of percentages');
  const accounts = computeAccountRows(scopeB, proposals());
  assert(accounts.length > 0 && accounts.every((a) => ['Tier 1', 'Tier 2', 'Tier 3', 'Unassigned'].includes(a.tier)), 'Account tiers come from ACC_TIER assignments');

  useAppStore.getState().resetDemo();

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runInsightsTests();
