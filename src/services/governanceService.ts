import {
  PersonaId,
  MarketCode,
  DimensionCode,
  Proposal,
  SegmentHistory,
  MarketStabilityPolicy,
  Threshold,
  ChangeEvent,
  ConfidenceLevel,
} from '../types';
import dataService from './dataService';
import { appConfig } from '../config/appConfig';

export interface ApprovalPermissionResult {
  allowed: boolean;
  reason?: string;
  approverRole?: PersonaId;
  coApproverRole?: PersonaId | null;
}

export interface ThresholdEvaluationResult {
  qualifies: boolean;
  score: number;
  confidence: ConfidenceLevel;
  reason?: string;
}

export interface StabilityCheckResult {
  status: 'Allowed' | 'Hold';
  rule?: string;
  reason?: string;
}

export const governanceService = {
  /**
   * Evaluates if a given persona has authority to approve a segment dimension change in a specific market.
   * Enforces Section 2 rule: "Global vocabulary, local control. AI proposes, people decide."
   */
  canApprove: (
    persona: PersonaId,
    market: MarketCode,
    dimension: DimensionCode
  ): ApprovalPermissionResult => {
    // Executive / Compliance (P6) is strictly read-only across all markets
    if (persona === 'P6') {
      return {
        allowed: false,
        reason: 'Your role (Executive / Compliance) is read-only.',
      };
    }

    // Local Agency (P5) only has intake upload rights for Market C, cannot approve governed segments
    if (persona === 'P5') {
      return {
        allowed: false,
        reason: 'Local agency vendors cannot approve governed customer segment fields.',
      };
    }

    // Global Lead (P1) has global authority over standards, studio templates, and recalibration
    // For individual customer segment proposals, check local approval matrix
    const rights = dataService.getApprovalRights(market, dimension);
    if (!rights || rights.length === 0) {
      return {
        allowed: false,
        reason: `No approval policy configured for ${dimension} in ${market}.`,
      };
    }

    const right = rights[0];

    // Primary approver check
    if (right.approver_role === persona) {
      return {
        allowed: true,
        approverRole: right.approver_role,
        coApproverRole: right.co_approver_role,
      };
    }

    // Co-approver check
    if (right.co_approver_role === persona) {
      return {
        allowed: true,
        approverRole: right.approver_role,
        coApproverRole: right.co_approver_role,
      };
    }

    // Global Segmentation Lead (P1) can act as escalation fallback
    if (persona === 'P1') {
      return {
        allowed: true,
        reason: 'Authorized as Global Segmentation Lead (escalation authority).',
        approverRole: right.approver_role,
      };
    }

    return {
      allowed: false,
      reason: 'Your role cannot approve this field in this market.',
      approverRole: right.approver_role,
    };
  },

  /**
   * Evaluates a signal event against market-configured thresholds.
   */
  checkThresholds: (
    event: ChangeEvent,
    threshold: Threshold
  ): ThresholdEvaluationResult => {
    // Check lookback window
    if (event.data_age_days > threshold.lookback_days) {
      return {
        qualifies: false,
        score: 0,
        confidence: 'Low',
        reason: `Signal data age (${event.data_age_days}d) exceeds maximum lookback of ${threshold.lookback_days}d.`,
      };
    }

    // Check magnitude parsing
    const numericMagnitude = parseFloat(event.magnitude.replace(/[^0-9.-]/g, '')) || 0;
    const thresholdVal = parseFloat(threshold.threshold_value.replace(/[^0-9.-]/g, '')) || 0;

    const qualifies = Math.abs(numericMagnitude) >= thresholdVal;

    let confidence: ConfidenceLevel = threshold.min_confidence;
    if (Math.abs(numericMagnitude) >= thresholdVal * 1.5) {
      confidence = 'High';
    } else if (Math.abs(numericMagnitude) >= thresholdVal) {
      confidence = 'Medium';
    } else {
      confidence = 'Low';
    }

    return {
      qualifies,
      score: numericMagnitude,
      confidence,
      reason: qualifies
        ? `Signal magnitude (${event.magnitude}) meets or exceeds threshold (${threshold.threshold_value}).`
        : `Signal magnitude (${event.magnitude}) is below trigger threshold (${threshold.threshold_value}).`,
    };
  },

  /**
   * Enforces market stability policy:
   * 1. Active freeze windows (e.g. incentive / commercial planning windows)
   * 2. Change frequency limit per customer per 180 days
   * 3. Minimum days between consecutive changes
   * 4. Conflicting signals detection (held for review, never auto-proposed)
   * 5. Minimum evidence validation
   */
  checkStability: (
    proposal: Proposal,
    history: SegmentHistory[] = [],
    policyInput?: MarketStabilityPolicy
  ): StabilityCheckResult => {
    const market = proposal.market_code;
    const policy = policyInput || (dataService.getStabilityPolicy(market) as MarketStabilityPolicy);

    if (!policy) {
      return { status: 'Allowed' };
    }

    const demoToday = new Date(appConfig.demoToday).getTime();

    // 1. Freeze window check
    if (policy.freeze_windows && policy.freeze_windows.length > 0) {
      for (const window of policy.freeze_windows) {
        const start = new Date(window.start).getTime();
        const end = new Date(window.end).getTime();
        if (demoToday >= start && demoToday <= end) {
          return {
            status: 'Hold',
            rule: 'STAB-FREEZE',
            reason: `Active freeze window enforced: ${window.name} (${window.start} to ${window.end}). Changes held until window concludes.`,
          };
        }
      }
    }

    // 2. Conflicting signal check
    // Hero case: HCP-B-0007 sales up but rep note indicates temporary trial
    if (
      proposal.hold_reason === 'Conflicting signals' ||
      proposal.status === 'Held' ||
      (proposal.drivers &&
        proposal.drivers.some(
          (d) =>
            d.label.toLowerCase().includes('contradict') ||
            d.value.toLowerCase().includes('temporary') ||
            d.value.toLowerCase().includes('conflicting')
        ))
    ) {
      return {
        status: 'Hold',
        rule: 'STAB-CONFLICT',
        reason: 'Conflicting signal detected across data sources. Held for human investigation.',
      };
    }

    // 3. Change-frequency limit (max changes per customer per 180 days)
    const customerHistory = history.filter((h) => h.customer_id === proposal.customer_id);
    const ms180Days = 180 * 24 * 60 * 60 * 1000;
    const recentChanges = customerHistory.filter((h) => {
      const changeTime = new Date(h.valid_from).getTime();
      return demoToday - changeTime <= ms180Days;
    });

    if (recentChanges.length >= policy.max_changes_per_customer_per_180d) {
      return {
        status: 'Hold',
        rule: 'STAB-FREQ',
        reason: `Change-frequency limit exceeded: customer already has ${recentChanges.length} changes in past 180 days (limit: ${policy.max_changes_per_customer_per_180d}).`,
      };
    }

    // 4. Minimum days between changes
    if (recentChanges.length > 0) {
      const lastChange = recentChanges[0];
      const daysSinceLastChange = Math.floor(
        (demoToday - new Date(lastChange.valid_from).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastChange < policy.min_days_between_changes) {
        return {
          status: 'Hold',
          rule: 'STAB-INTERVAL',
          reason: `Minimum interval not met: only ${daysSinceLastChange} days since last change (minimum required: ${policy.min_days_between_changes} days).`,
        };
      }
    }

    // 5. Minimum evidence validation
    if (proposal.confidence === 'Low' && (!proposal.drivers || proposal.drivers.length < 2)) {
      return {
        status: 'Hold',
        rule: 'STAB-EVID',
        reason: 'Insufficient independent evidence (low confidence with fewer than 2 supporting drivers).',
      };
    }

    return {
      status: 'Allowed',
    };
  },
};

export default governanceService;
