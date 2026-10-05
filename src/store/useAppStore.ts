import { create } from 'zustand';
import {
  PersonaId,
  MarketCode,
  BrandCode,
  Proposal,
  AuditLogEntry,
  PublishLogEntry,
  SegmentLibraryVersion,
  CrmRecord,
  RejectionReason,
  HoldReason,
} from '../types';
import dataService from '../services/dataService';
import { appConfig } from '../config/appConfig';

/**
 * Initializes mock CRM records from customer master and current proposals.
 */
function createInitialCrmRecords(): CrmRecord[] {
  const hcps = dataService.getHcps();
  const accounts = dataService.getAccounts();
  const proposals = dataService.getProposals();

  const records: CrmRecord[] = [];

  // Seed HCP CRM records
  hcps.forEach((hcp) => {
    const proposal = proposals.find((p) => p.customer_id === hcp.hcp_id);
    records.push({
      customer_id: hcp.hcp_id,
      customer_type: 'HCP',
      market_code: hcp.market_code,
      brand_code: 'AUR',
      customer_name: hcp.display_name,
      specialty: hcp.specialty,
      segment: proposal ? proposal.current_value : 'Segment B',
      proposed_segment: proposal ? proposal.proposed_value : null,
      segment_age_days: proposal ? proposal.segment_age_days : 90,
      last_sync_date: '2026-05-04',
      sync_status: proposal?.status === 'Approved' ? 'Pending publish' : 'Synced',
    });
  });

  // Seed Account CRM records
  accounts.forEach((acc) => {
    const proposal = proposals.find((p) => p.customer_id === acc.hco_id);
    records.push({
      customer_id: acc.hco_id,
      customer_type: 'HCO',
      market_code: acc.market_code,
      brand_code: 'ZEN',
      customer_name: acc.name,
      account_name: acc.name,
      segment: proposal ? proposal.current_value : acc.archetype,
      proposed_segment: proposal ? proposal.proposed_value : null,
      segment_age_days: proposal ? proposal.segment_age_days : 110,
      last_sync_date: '2026-04-10',
      sync_status: proposal?.status === 'Approved' ? 'Pending publish' : 'Synced',
    });
  });

  return records;
}

export interface AppState {
  currentPersona: PersonaId;
  currentMarket: MarketCode | 'ALL';
  currentBrand: BrandCode | 'ALL';
  guidedDemoActive: boolean;
  guidedStep: number;
  selectedCustomerId: string | null;

  // Governed Entities
  proposals: Proposal[];
  libraryVersions: SegmentLibraryVersion[];
  auditLog: AuditLogEntry[];
  publishLog: PublishLogEntry[];
  crmRecords: CrmRecord[];

  // TopBar / Global actions
  setPersona: (persona: PersonaId) => void;
  setMarket: (market: MarketCode | 'ALL') => void;
  setBrand: (brand: BrandCode | 'ALL') => void;
  setGuidedDemoActive: (active: boolean) => void;
  setGuidedStep: (step: number) => void;
  setSelectedCustomerId: (id: string | null) => void;

  // Proposal Workflow Actions
  approveProposal: (proposalId: string, approverRole: PersonaId, notes?: string) => void;
  rejectProposal: (
    proposalId: string,
    reason: RejectionReason,
    approverRole: PersonaId,
    notes?: string
  ) => void;
  holdProposal: (proposalId: string, rule: string, reason: HoldReason) => void;

  // Publishing & CRM Write-back
  publishToCrm: (
    marketCode?: MarketCode | 'ALL',
    targetSystems?: string[]
  ) => { publishedCount: number };

  // Segment Library Version Management
  createLibraryVersion: (versionData: Partial<SegmentLibraryVersion>) => SegmentLibraryVersion;
  approveLibraryVersion: (versionId: string, approverId: string) => void;
  activateLibraryVersion: (versionId: string) => void;

  // Reset Demo to fresh state
  resetDemo: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPersona: 'P1',
  currentMarket: 'ALL',
  currentBrand: 'AUR',
  guidedDemoActive: false,
  guidedStep: 1,
  selectedCustomerId: null,

  proposals: dataService.getProposals(),
  libraryVersions: dataService.getSegmentLibrary(),
  auditLog: dataService.getAuditLog(),
  publishLog: dataService.getPublishLog(),
  crmRecords: createInitialCrmRecords(),

  setPersona: (persona) => {
    // If switching to P2 (Market Back Office), default to MKT_B per Section 5.1
    if (persona === 'P2') {
      set({ currentPersona: persona, currentMarket: 'MKT_B' });
    } else if (persona === 'P5') {
      // Local agency vendor locked to MKT_C
      set({ currentPersona: persona, currentMarket: 'MKT_C' });
    } else {
      set({ currentPersona: persona });
    }
  },

  setMarket: (market) => set({ currentMarket: market }),
  setBrand: (brand) => set({ currentBrand: brand }),
  setGuidedDemoActive: (active) => set({ guidedDemoActive: active }),
  setGuidedStep: (step) => set({ guidedStep: step }),
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

  approveProposal: (proposalId, approverRole, notes) => {
    const { proposals, auditLog, crmRecords } = get();
    const proposal = proposals.find((p) => p.proposal_id === proposalId);
    if (!proposal) return;

    const timestamp = '2026-10-15T10:15:00Z';

    const updatedProposals = proposals.map((p) =>
      p.proposal_id === proposalId
        ? {
            ...p,
            status: 'Approved' as const,
            decided_at: timestamp,
            decided_by: `USR-${approverRole}`,
            decision_reason: notes || 'Approved by named owner',
          }
        : p
    );

    const newAuditEntry: AuditLogEntry = {
      audit_id: `AUD-APP-${Date.now()}`,
      timestamp,
      market_code: proposal.market_code,
      actor_user_id: `USR-${approverRole}`,
      actor_persona: approverRole,
      action: 'Proposal approved',
      entity_type: proposal.customer_type,
      entity_id: proposal.customer_id,
      before_value: proposal.current_value,
      after_value: proposal.proposed_value,
      reason: notes || 'Proposal approved and queued for publish to CRM',
      evidence_refs: proposal.drivers.map((d) => d.label),
    };

    const updatedCrm = crmRecords.map((r) =>
      r.customer_id === proposal.customer_id
        ? { ...r, proposed_segment: proposal.proposed_value, sync_status: 'Pending publish' as const }
        : r
    );

    set({
      proposals: updatedProposals,
      auditLog: [newAuditEntry, ...auditLog],
      crmRecords: updatedCrm,
    });
  },

  rejectProposal: (proposalId, reason, approverRole, notes) => {
    const { proposals, auditLog, crmRecords } = get();
    const proposal = proposals.find((p) => p.proposal_id === proposalId);
    if (!proposal) return;

    const timestamp = '2026-10-15T10:18:00Z';

    const updatedProposals = proposals.map((p) =>
      p.proposal_id === proposalId
        ? {
            ...p,
            status: 'Rejected' as const,
            decision_reason: reason,
            decided_at: timestamp,
            decided_by: `USR-${approverRole}`,
          }
        : p
    );

    const newAuditEntry: AuditLogEntry = {
      audit_id: `AUD-REJ-${Date.now()}`,
      timestamp,
      market_code: proposal.market_code,
      actor_user_id: `USR-${approverRole}`,
      actor_persona: approverRole,
      action: 'Proposal rejected',
      entity_type: proposal.customer_type,
      entity_id: proposal.customer_id,
      before_value: proposal.current_value,
      after_value: proposal.current_value,
      reason: `${reason}${notes ? `: ${notes}` : ''}`,
      evidence_refs: [],
    };

    const updatedCrm = crmRecords.map((r) =>
      r.customer_id === proposal.customer_id
        ? { ...r, proposed_segment: null, sync_status: 'Synced' as const }
        : r
    );

    set({
      proposals: updatedProposals,
      auditLog: [newAuditEntry, ...auditLog],
      crmRecords: updatedCrm,
    });
  },

  holdProposal: (proposalId, rule, reason) => {
    const { proposals, auditLog } = get();
    const proposal = proposals.find((p) => p.proposal_id === proposalId);
    if (!proposal) return;

    const timestamp = '2026-10-15T10:20:00Z';

    const updatedProposals = proposals.map((p) =>
      p.proposal_id === proposalId
        ? {
            ...p,
            status: 'Held' as const,
            hold_reason: reason,
            policy_rule_ref: rule,
          }
        : p
    );

    const newAuditEntry: AuditLogEntry = {
      audit_id: `AUD-HLD-${Date.now()}`,
      timestamp,
      market_code: proposal.market_code,
      actor_user_id: 'SYSTEM_STABILITY_ENGINE',
      actor_persona: 'P1',
      action: 'Proposal held',
      entity_type: proposal.customer_type,
      entity_id: proposal.customer_id,
      before_value: proposal.current_value,
      after_value: proposal.proposed_value,
      reason: `Hold enforced by policy rule ${rule}: ${reason}`,
      evidence_refs: [],
    };

    set({
      proposals: updatedProposals,
      auditLog: [newAuditEntry, ...auditLog],
    });
  },

  publishToCrm: (marketCode = 'ALL', targetSystems = ['Veeva CRM', 'Targeting Engine']) => {
    const { proposals, crmRecords, auditLog, publishLog } = get();

    // Select approved proposals matching market
    const toPublish = proposals.filter((p) => {
      const matchMarket = marketCode === 'ALL' || p.market_code === marketCode;
      return matchMarket && p.status === 'Approved';
    });

    if (toPublish.length === 0) {
      return { publishedCount: 0 };
    }

    const timestamp = '2026-10-15T10:30:00Z';
    const publishId = `PUB-${Date.now()}`;

    // 1. Mark proposals as 'Written back'
    const publishedIds = new Set(toPublish.map((p) => p.proposal_id));
    const updatedProposals = proposals.map((p) =>
      publishedIds.has(p.proposal_id) ? { ...p, status: 'Written back' as const } : p
    );

    // 2. Write to CRM records: update segment, reset proposed_segment and segment_age_days to 0
    const publishedCustomerMap = new Map(toPublish.map((p) => [p.customer_id, p.proposed_value]));
    const updatedCrm = crmRecords.map((r) => {
      if (publishedCustomerMap.has(r.customer_id)) {
        return {
          ...r,
          segment: publishedCustomerMap.get(r.customer_id)!,
          proposed_segment: null,
          segment_age_days: 0, // Reset age on write-back per brief Section 11
          last_sync_date: '2026-10-15',
          sync_status: 'Synced' as const,
        };
      }
      return r;
    });

    // 3. Add publish log entry
    const newPublishEntry: PublishLogEntry = {
      publish_id: publishId,
      market_code: marketCode === 'ALL' ? 'MKT_B' : marketCode,
      version_id: 'VER-2026-02-B',
      published_at: timestamp,
      published_by: 'Commercial Excellence',
      records_written: toPublish.length,
      target_systems: targetSystems,
      status: 'Success',
    };

    // 4. Add audit log entries for write-back
    const newAuditEntries: AuditLogEntry[] = toPublish.map((p) => ({
      audit_id: `AUD-WB-${p.proposal_id}-${Date.now()}`,
      timestamp,
      market_code: p.market_code,
      actor_user_id: 'SYSTEM_CRM_SYNC',
      actor_persona: 'P2',
      action: 'Written back',
      entity_type: p.customer_type,
      entity_id: p.customer_id,
      before_value: p.current_value,
      after_value: p.proposed_value,
      reason: 'Approved change written back to CRM and downstream targeting',
      evidence_refs: [publishId],
    }));

    set({
      proposals: updatedProposals,
      crmRecords: updatedCrm,
      publishLog: [newPublishEntry, ...publishLog],
      auditLog: [...newAuditEntries, ...auditLog],
    });

    return { publishedCount: toPublish.length };
  },

  createLibraryVersion: (versionData) => {
    const { libraryVersions, auditLog } = get();
    const newVersion: SegmentLibraryVersion = {
      version_id: `VER-${Date.now()}`,
      name: versionData.name || 'New Segment Model',
      market_code: versionData.market_code || 'MKT_B',
      brand_code: versionData.brand_code || 'AUR',
      customer_type: versionData.customer_type || 'HCP',
      method: versionData.method || 'KMEANS_RULES',
      parameters: versionData.parameters || {},
      status: 'Draft',
      author_user_id: 'USR-P1',
      created_date: appConfig.demoToday,
      approved_by: null,
      approved_date: null,
      activated_date: null,
      records_segmented: versionData.records_segmented || 0,
      mapped_to_global: false,
      notes: versionData.notes || 'Created via Segmentation Studio',
    };

    set({
      libraryVersions: [newVersion, ...libraryVersions],
      auditLog: [
        {
          audit_id: `AUD-VER-${Date.now()}`,
          timestamp: '2026-10-15T10:00:00Z',
          market_code: newVersion.market_code,
          actor_user_id: 'USR-P1',
          actor_persona: 'P1',
          action: 'Threshold changed',
          entity_type: 'SegmentLibraryVersion',
          entity_id: newVersion.version_id,
          before_value: 'None',
          after_value: 'Draft',
          reason: 'Created new segmentation studio version',
          evidence_refs: [],
        },
        ...auditLog,
      ],
    });

    return newVersion;
  },

  approveLibraryVersion: (versionId, approverId) => {
    const { libraryVersions, auditLog } = get();
    const updated = libraryVersions.map((v) =>
      v.version_id === versionId
        ? {
            ...v,
            status: 'Approved' as const,
            approved_by: approverId,
            approved_date: '2026-10-15',
          }
        : v
    );

    set({
      libraryVersions: updated,
      auditLog: [
        {
          audit_id: `AUD-VAPP-${Date.now()}`,
          timestamp: '2026-10-15T10:05:00Z',
          market_code: 'MKT_B',
          actor_user_id: approverId,
          actor_persona: 'P1',
          action: 'Version approved',
          entity_type: 'SegmentLibraryVersion',
          entity_id: versionId,
          before_value: 'Draft',
          after_value: 'Approved',
          reason: 'Global Segmentation Lead approved library version',
          evidence_refs: [],
        },
        ...auditLog,
      ],
    });
  },

  activateLibraryVersion: (versionId) => {
    const { libraryVersions, auditLog } = get();
    const target = libraryVersions.find((v) => v.version_id === versionId);
    if (!target) return;

    // Retire previously active version for same market/brand/customer_type
    const updated = libraryVersions.map((v) => {
      if (
        v.market_code === target.market_code &&
        v.brand_code === target.brand_code &&
        v.customer_type === target.customer_type &&
        v.status === 'Active'
      ) {
        return { ...v, status: 'Retired' as const };
      }
      if (v.version_id === versionId) {
        return { ...v, status: 'Active' as const, activated_date: '2026-10-15' };
      }
      return v;
    });

    set({
      libraryVersions: updated,
      auditLog: [
        {
          audit_id: `AUD-VACT-${Date.now()}`,
          timestamp: '2026-10-15T10:10:00Z',
          market_code: target.market_code,
          actor_user_id: 'USR-P1',
          actor_persona: 'P1',
          action: 'Version activated',
          entity_type: 'SegmentLibraryVersion',
          entity_id: versionId,
          before_value: 'Approved',
          after_value: 'Active',
          reason: 'Activated segment version for CRM publishing',
          evidence_refs: [],
        },
        ...auditLog,
      ],
    });
  },

  resetDemo: () => {
    set({
      currentPersona: 'P1',
      currentMarket: 'ALL',
      currentBrand: 'AUR',
      guidedDemoActive: false,
      guidedStep: 1,
      selectedCustomerId: null,
      proposals: dataService.getProposals(),
      libraryVersions: dataService.getSegmentLibrary(),
      auditLog: dataService.getAuditLog(),
      publishLog: dataService.getPublishLog(),
      crmRecords: createInitialCrmRecords(),
    });
  },
}));

export default useAppStore;
