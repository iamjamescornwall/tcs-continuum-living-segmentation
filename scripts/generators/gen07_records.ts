/**
 * Prompt 7: Records and learning generator
 * Produces audit_log.json, publish_log.json, downstream_impact.json,
 * recalibration.json
 */

import {
  AuditLogEntry,
  PublishLogEntry,
  DownstreamImpact,
  RecalibrationRecommendation,
  Proposal,
  SegmentLibraryVersion,
  MarketCode,
} from '../../src/types';
import { GeneratorContext, writeJsonFile } from '../utils';

export function generateRecordsData(
  ctx: GeneratorContext,
  proposals: Proposal[],
  library: SegmentLibraryVersion[]
): {
  auditLog: AuditLogEntry[];
  publishLog: PublishLogEntry[];
  downstreamImpact: DownstreamImpact[];
  recalibration: RecalibrationRecommendation[];
} {
  const auditLog: AuditLogEntry[] = [];
  let audCounter = 1;

  // 1. Audit log generation
  // For each proposal that was approved, rejected, or written back:
  const decidedProposals = proposals.filter((p) => p.status !== 'Proposed' && p.status !== 'Held');

  decidedProposals.forEach((p) => {
    if (p.status === 'Approved' || p.status === 'Written back') {
      const approvedTime = p.decided_at || '2026-10-09T14:30:00Z';

      auditLog.push({
        audit_id: `AUD-${String(audCounter++).padStart(6, '0')}`,
        timestamp: approvedTime,
        market_code: p.market_code,
        actor_user_id: p.decided_by || 'USR-002',
        actor_persona: p.approver_role,
        action: 'Proposal approved',
        entity_type: p.customer_type === 'HCP' ? 'hcp_segment' : 'account_segment',
        entity_id: p.customer_id,
        before_value: p.current_value,
        after_value: p.proposed_value,
        reason: p.decision_reason || 'Evidence confirmed by commercial owner',
        evidence_refs: p.flag_ids,
      });

      if (p.status === 'Written back') {
        // Must follow Proposal approved!
        auditLog.push({
          audit_id: `AUD-${String(audCounter++).padStart(6, '0')}`,
          timestamp: '2026-10-10T18:00:00Z',
          market_code: p.market_code,
          actor_user_id: 'USR-001',
          actor_persona: 'P1',
          action: 'Written back',
          entity_type: p.customer_type === 'HCP' ? 'hcp_segment' : 'account_segment',
          entity_id: p.customer_id,
          before_value: p.current_value,
          after_value: p.proposed_value,
          reason: 'Published to CRM via Continuum automated write-back',
          evidence_refs: [`PUB-00000${p.market_code === 'MKT_A' ? '1' : p.market_code === 'MKT_B' ? '2' : '3'}`],
        });
      }
    } else if (p.status === 'Rejected') {
      auditLog.push({
        audit_id: `AUD-${String(audCounter++).padStart(6, '0')}`,
        timestamp: p.decided_at || '2026-10-08T15:00:00Z',
        market_code: p.market_code,
        actor_user_id: p.decided_by || 'USR-002',
        actor_persona: p.approver_role,
        action: 'Proposal rejected',
        entity_type: p.customer_type === 'HCP' ? 'hcp_segment' : 'account_segment',
        entity_id: p.customer_id,
        before_value: p.current_value,
        after_value: p.current_value,
        reason: p.decision_reason || 'Rejected by owner',
        evidence_refs: p.flag_ids,
      });
    }
  });

  // Library activations and approvals in audit log
  library.forEach((v) => {
    if (v.status === 'Active' || v.status === 'Retired') {
      auditLog.push({
        audit_id: `AUD-${String(audCounter++).padStart(6, '0')}`,
        timestamp: `${v.activated_date || '2026-08-01'}T09:00:00Z`,
        market_code: v.market_code,
        actor_user_id: v.approved_by || 'USR-001',
        actor_persona: 'P1',
        action: 'Version activated',
        entity_type: 'segment_library_version',
        entity_id: v.version_id,
        before_value: 'Approved',
        after_value: 'Active',
        reason: `Activated ${v.name} as production version for ${v.brand_code}`,
        evidence_refs: [v.version_id],
      });
    }
  });

  // Fill remaining audit log entries to reach ~400 rows
  const pastDates = [
    '2026-07-12T10:15:00Z', '2026-07-28T14:22:00Z',
    '2026-08-05T09:40:00Z', '2026-08-19T16:11:00Z',
    '2026-09-02T11:05:00Z', '2026-09-18T13:45:00Z',
  ];

  while (auditLog.length < 400) {
    const m: MarketCode = ctx.choice(['MKT_A', 'MKT_B', 'MKT_C']);
    const ts = ctx.choice(pastDates);
    const action = ctx.choice([
      'Threshold changed',
      'Mapping accepted',
      'Proposal held',
      'Recalibration approved',
    ]);

    auditLog.push({
      audit_id: `AUD-${String(audCounter++).padStart(6, '0')}`,
      timestamp: ts,
      market_code: m,
      actor_user_id: m === 'MKT_A' ? 'USR-003' : (m === 'MKT_B' ? 'USR-002' : 'USR-004'),
      actor_persona: 'P2',
      action: action as any,
      entity_type: action === 'Threshold changed' ? 'threshold' : (action === 'Mapping accepted' ? 'vocabulary_map' : 'policy_rule'),
      entity_id: `REF-${ctx.randomInt(100, 999)}`,
      before_value: 'Initial',
      after_value: 'Updated',
      reason: `Routine governance cycle adjustment for ${m}`,
      evidence_refs: [],
    });
  }

  // Sort audit log chronologically descending for display
  auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 2. publish_log.json
  const writtenBackA = proposals.filter((p) => p.market_code === 'MKT_A' && p.status === 'Written back').length;
  const writtenBackB = proposals.filter((p) => p.market_code === 'MKT_B' && p.status === 'Written back').length;
  const writtenBackC = proposals.filter((p) => p.market_code === 'MKT_C' && p.status === 'Written back').length;

  const publishLog: PublishLogEntry[] = [
    {
      publish_id: 'PUB-000001',
      market_code: 'MKT_A',
      version_id: 'VER-0001',
      published_at: '2026-10-10T18:00:00Z',
      published_by: 'USR-001',
      records_written: writtenBackA,
      target_systems: ['CRM segment field', 'Proposed-segment field', 'Campaign audiences', 'NBA context'],
      status: 'Success',
    },
    {
      publish_id: 'PUB-000002',
      market_code: 'MKT_B',
      version_id: 'VER-0003',
      published_at: '2026-10-10T18:05:00Z',
      published_by: 'USR-001',
      records_written: writtenBackB,
      target_systems: ['CRM segment field', 'Proposed-segment field', 'Campaign audiences', 'NBA context'],
      status: 'Success',
    },
    {
      publish_id: 'PUB-000003',
      market_code: 'MKT_C',
      version_id: 'VER-0004',
      published_at: '2026-10-10T18:10:00Z',
      published_by: 'USR-001',
      records_written: writtenBackC,
      target_systems: ['CRM segment field', 'Campaign audiences'],
      status: 'Success',
    },
  ];

  // 3. downstream_impact.json (includes DATA_SPEC 7.6 figures)
  const downstreamImpact: DownstreamImpact[] = [
    {
      market_code: 'MKT_A',
      brand_code: 'AUR',
      consumer: 'Call planning',
      metric: 'A/B segment calls planned',
      before: 1840,
      after: 2060,
      period: 'Q4 2026',
    },
    {
      market_code: 'MKT_A',
      brand_code: 'AUR',
      consumer: 'Targeting',
      metric: 'Target customer universe list size',
      before: 610,
      after: 642,
      period: 'Q4 2026',
    },
    {
      market_code: 'MKT_B',
      brand_code: 'ZEN',
      consumer: 'Next-best-action',
      metric: 'Customer context records refreshed',
      before: 0,
      after: 186,
      period: 'Q4 2026',
    },
    {
      market_code: 'MKT_B',
      brand_code: 'AUR',
      consumer: 'Journeys',
      metric: 'Audience re-entries triggered',
      before: 0,
      after: 74,
      period: 'Q4 2026',
    },
    {
      market_code: 'MKT_A',
      brand_code: 'AUR',
      consumer: 'Segment-health dashboard',
      metric: 'Active segment currency (<90d)',
      before: 0.68,
      after: 0.88,
      period: 'Q4 2026',
    },
    {
      market_code: 'MKT_B',
      brand_code: 'AUR',
      consumer: 'Call planning',
      metric: 'High-affinity digital contacts scheduled',
      before: 420,
      after: 580,
      period: 'Q4 2026',
    },
  ];

  // 4. recalibration.json
  const recalibration: RecalibrationRecommendation[] = [
    {
      recommendation_id: 'REC-001',
      market_code: 'MKT_A',
      dimension_code: 'ADOPTION',
      issue: 'High rejection rate due to short-lived prescription spikes.',
      evidence: {
        rejections: 12,
        rejection_rate: 0.38,
        top_reason: 'Temporary behaviour',
        override_rate_before: 0.21,
        override_rate_after: 0.08,
        coverage_of_rising_customers: 0.89,
      },
      recommendation: 'Raise lookback window for ADOPTION drift detection from 90 to 120 days to filter transient trial activity.',
      status: 'Recommended',
      model_owner_user_id: 'USR-001',
    },
    {
      recommendation_id: 'REC-002',
      market_code: 'MKT_B',
      dimension_code: 'SEGMENT',
      issue: 'Brick volume noise in low-density suburban territories.',
      evidence: {
        rejections: 6,
        rejection_rate: 0.18,
        top_reason: 'Data quality issue',
        override_rate_before: 0.25,
        override_rate_after: 0.11,
        coverage_of_rising_customers: 0.82,
      },
      recommendation: 'Increase minimum independent signals requirement from 1 to 2 in non-urban brick clusters.',
      status: 'Under validation',
      model_owner_user_id: 'USR-001',
    },
    {
      recommendation_id: 'REC-003',
      market_code: 'MKT_C',
      dimension_code: 'POTENTIAL',
      issue: 'Rep assessment variability across peripheral territories.',
      evidence: {
        rejections: 4,
        rejection_rate: 0.15,
        top_reason: 'Field knowledge contradicts signal',
        override_rate_before: 0.32,
        override_rate_after: 0.14,
        coverage_of_rising_customers: 0.76,
      },
      recommendation: 'Incorporate PMR wave alignment check prior to drafting POTENTIAL proposals.',
      status: 'Recommended',
      model_owner_user_id: 'USR-001',
    },
  ];

  writeJsonFile('audit_log.json', auditLog);
  writeJsonFile('publish_log.json', publishLog);
  writeJsonFile('downstream_impact.json', downstreamImpact);
  writeJsonFile('recalibration.json', recalibration);

  return { auditLog, publishLog, downstreamImpact, recalibration };
}
