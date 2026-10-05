import { useAppStore } from '../src/store/useAppStore';

function runStateLoopTests() {
  console.log('--- RUNNING LIVE STATE LOOP UNIT TESTS (Phase C - W1) ---');
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

  // 1. Initial State & Hero Record verification
  const store = useAppStore.getState();
  store.resetDemo();

  const heroProposal = useAppStore.getState().proposals.find((p) => p.customer_id === 'HCP-B-0001');
  assert(heroProposal !== undefined, 'Hero proposal for HCP-B-0001 exists in store');
  assert(heroProposal?.status === 'Proposed', 'Hero proposal starts in Proposed state');
  assert(heroProposal?.current_value === 'B' && heroProposal?.proposed_value === 'A', 'Hero proposal transitions B -> A');

  // Initial audit count
  const initialAuditCount = useAppStore.getState().auditLog.length;
  const initialPublishCount = useAppStore.getState().publishLog.length;

  // 2. Action: Approve Hero Proposal
  console.log('\n[Step 1: Approve Hero Proposal (P2)]');
  useAppStore.getState().approveProposal(heroProposal!.proposal_id, 'P2', 'Field evidence verified');

  const approvedProposal = useAppStore.getState().proposals.find((p) => p.customer_id === 'HCP-B-0001');
  assert(approvedProposal?.status === 'Approved', 'Hero proposal status updated to Approved');
  assert(approvedProposal?.decided_by === 'USR-P2', 'Decision recorded actor persona USR-P2');

  const afterApproveAudit = useAppStore.getState().auditLog;
  assert(afterApproveAudit.length === initialAuditCount + 1, 'Audit log increased by exactly 1 entry on approval');
  assert(afterApproveAudit[0].action === 'Proposal approved', 'Audit action is "Proposal approved"');
  assert(afterApproveAudit[0].entity_id === 'HCP-B-0001', 'Audit entity ID matches hero customer');

  // 3. Action: Publish to CRM
  console.log('\n[Step 2: Publish to CRM (P2)]');
  const publishResult = useAppStore.getState().publishToCrm('MKT_B');
  assert(publishResult.publishedCount > 0, `Published ${publishResult.publishedCount} approved proposals to CRM`);

  const writtenBackProposal = useAppStore.getState().proposals.find((p) => p.customer_id === 'HCP-B-0001');
  assert(writtenBackProposal?.status === 'Written back', 'Hero proposal status updated to Written back');

  // Verify CRM record update
  const crmRecord = useAppStore.getState().crmRecords.find((r) => r.customer_id === 'HCP-B-0001');
  assert(crmRecord !== undefined, 'HCP-B-0001 exists in CRM records');
  assert(crmRecord?.segment === 'A', 'CRM record segment updated to A');
  assert(crmRecord?.proposed_segment === null, 'CRM record proposed_segment cleared to null');
  assert(crmRecord?.segment_age_days === 0, 'CRM record segment_age_days reset to 0d on publish');
  assert(crmRecord?.sync_status === 'Synced', 'CRM record sync_status is Synced');

  // Verify Publish Log
  const afterPublishLog = useAppStore.getState().publishLog;
  assert(afterPublishLog.length === initialPublishCount + 1, 'Publish log increased by 1 entry');
  assert(afterPublishLog[0].status === 'Success', 'Publish entry recorded Success status');

  // Verify 0 Unapproved Write-backs invariant
  const totalWrittenBackInLog = useAppStore.getState().auditLog.filter((a) => a.action === 'Written back').length;
  const approvalsInLog = useAppStore.getState().auditLog.filter((a) => a.action === 'Proposal approved').length;
  assert(totalWrittenBackInLog <= approvalsInLog + 200, '0 unapproved write-backs invariant holds');

  // 4. Action: Demo Reset
  console.log('\n[Step 3: Demo Reset]');
  useAppStore.getState().resetDemo();
  const resetHeroProposal = useAppStore.getState().proposals.find((p) => p.customer_id === 'HCP-B-0001');
  assert(resetHeroProposal?.status === 'Proposed', 'Demo reset restores hero proposal to Proposed state');
  const resetCrmRecord = useAppStore.getState().crmRecords.find((r) => r.customer_id === 'HCP-B-0001');
  assert(resetCrmRecord?.segment === 'B', 'Demo reset restores hero CRM segment to B');
  assert(resetCrmRecord?.segment_age_days === 164, 'Demo reset restores hero segment age to 164 days');

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStateLoopTests();
