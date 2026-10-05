import { z } from 'zod';
import {
  Market,
  Brand,
  Persona,
  User,
  Dimension,
  ApprovalRight,
  Threshold,
  StabilityPolicy,
  MarketStabilityPolicy,
  VocabularyMapEntry,
  HCP,
  Account,
  Affiliation,
  ConsentRecord,
  SalesRecord,
  CrmActivity,
  DigitalEngagement,
  PmrResponse,
  FormularyStatus,
  KolInfluence,
  RepNote,
  FeatureStoreItem,
  SegmentAssignment,
  SegmentHistory,
  SegmentLibraryVersion,
  StudioOutput,
  ChangeEvent,
  DriftFlag,
  Proposal,
  AuditLogEntry,
  PublishLogEntry,
  DownstreamImpact,
  RecalibrationRecommendation,
  AggregatesData,
  MarketCode,
  BrandCode,
  CustomerType,
  ProposalStatus,
  DimensionCode,
  SegmentStatus,
  VendorFileRecord,
  SalesQueryResult,
} from '../types';

// Raw JSON imports
import marketsJson from '../../data/markets.json';
import brandsJson from '../../data/brands.json';
import personasJson from '../../data/personas.json';
import usersJson from '../../data/users.json';
import aggregatesJson from '../../data/aggregates.json';
import dimensionsJson from '../../data/dimensions.json';
import approvalRightsJson from '../../data/approval_rights.json';
import thresholdsJson from '../../data/thresholds.json';
import stabilityPolicyJson from '../../data/stability_policy.json';
import vocabularyMapJson from '../../data/vocabulary_map.json';
import hcpsJson from '../../data/hcps.json';
import accountsJson from '../../data/accounts.json';
import affiliationsJson from '../../data/affiliations.json';
import consentJson from '../../data/consent.json';
import salesJson from '../../data/sales.json';
import crmActivityJson from '../../data/crm_activity.json';
import digitalEngagementJson from '../../data/digital_engagement.json';
import pmrResponsesJson from '../../data/pmr_responses.json';
import formularyStatusJson from '../../data/formulary_status.json';
import kolInfluenceJson from '../../data/kol_influence.json';
import repNotesJson from '../../data/rep_notes.json';
import featureStoreJson from '../../data/feature_store.json';
import segmentAssignmentsJson from '../../data/segment_assignments.json';
import segmentHistoryJson from '../../data/segment_history.json';
import segmentLibraryJson from '../../data/segment_library.json';
import studioOutputsJson from '../../data/studio_outputs.json';
import changeEventsJson from '../../data/change_events.json';
import driftFlagsJson from '../../data/drift_flags.json';
import proposalsJson from '../../data/proposals.json';
import auditLogJson from '../../data/audit_log.json';
import publishLogJson from '../../data/publish_log.json';
import downstreamImpactJson from '../../data/downstream_impact.json';
import recalibrationJson from '../../data/recalibration.json';
import vendorFileMktCJson from '../../data/vendor_file_mkt_c.json';
import aiCacheJson from '../../data/ai_cache.json';

// Hero records prioritization ordering
export const HERO_RECORD_IDS = [
  'HCP-B-0001', // Dr. Hanna Vogel (Hero Prescriber)
  'ACC-B-001',  // Hero Account
  'HCP-B-0002', // Oncology Dr. 2 (Formulary propagation)
  'HCP-B-0003',
  'HCP-B-0004',
  'HCP-B-0005',
  'HCP-B-0006',
  'HCP-B-0007', // Held: conflicting signals
  'HCP-A-0001', // Held: freeze window
  'HCP-A-0002', // Rejected analysis
  'HCP-A-0003', // K-means hero
  'HCP-C-0001', // Market C survey-led
  'HCP-B-0010', // Cardivance below threshold
  'HCP-B-0020', // Neurelle high digital
];

/**
 * Validates data on load with Zod without throwing errors.
 */
function validateData<T>(name: string, data: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn(`[dataService] Schema validation warning for ${name}:`, result.error.issues);
    return data as T;
  }
  return result.data;
}

// Validation schemas (structural sanity checks)
const baseArraySchema = z.array(z.record(z.unknown()));
const baseObjectSchema = z.record(z.unknown());

// Validate datasets on load
const markets = validateData('markets', marketsJson, baseArraySchema) as unknown as Market[];
const brands = validateData('brands', brandsJson, baseArraySchema) as unknown as Brand[];
const personas = validateData('personas', personasJson, baseArraySchema) as unknown as Persona[];
const users = validateData('users', usersJson, baseArraySchema) as unknown as User[];
const aggregates = validateData('aggregates', aggregatesJson, baseObjectSchema) as unknown as AggregatesData;
const dimensions = validateData('dimensions', dimensionsJson, baseArraySchema) as unknown as Dimension[];
const approvalRights = validateData('approval_rights', approvalRightsJson, baseArraySchema) as unknown as ApprovalRight[];
const thresholds = validateData('thresholds', thresholdsJson, baseArraySchema) as unknown as Threshold[];
const stabilityPolicy = validateData('stability_policy', stabilityPolicyJson, baseObjectSchema) as unknown as StabilityPolicy;
const vocabularyMap = validateData('vocabulary_map', vocabularyMapJson, baseArraySchema) as unknown as VocabularyMapEntry[];
const hcps = validateData('hcps', hcpsJson, baseArraySchema) as unknown as HCP[];
const accounts = validateData('accounts', accountsJson, baseArraySchema) as unknown as Account[];
const affiliations = validateData('affiliations', affiliationsJson, baseArraySchema) as unknown as Affiliation[];
const consent = validateData('consent', consentJson, baseArraySchema) as unknown as ConsentRecord[];
const sales = validateData('sales', salesJson, baseArraySchema) as unknown as SalesRecord[];
const crmActivity = validateData('crm_activity', crmActivityJson, baseArraySchema) as unknown as CrmActivity[];
const digitalEngagement = validateData('digital_engagement', digitalEngagementJson, baseArraySchema) as unknown as DigitalEngagement[];
const pmrResponses = validateData('pmr_responses', pmrResponsesJson, baseArraySchema) as unknown as PmrResponse[];
const formularyStatus = validateData('formulary_status', formularyStatusJson, baseArraySchema) as unknown as FormularyStatus[];
const kolInfluence = validateData('kol_influence', kolInfluenceJson, baseArraySchema) as unknown as KolInfluence[];
const repNotes = validateData('rep_notes', repNotesJson, baseArraySchema) as unknown as RepNote[];
const featureStore = validateData('feature_store', featureStoreJson, baseArraySchema) as unknown as FeatureStoreItem[];
const segmentAssignments = validateData('segment_assignments', segmentAssignmentsJson, baseArraySchema) as unknown as SegmentAssignment[];
const segmentHistory = validateData('segment_history', segmentHistoryJson, baseArraySchema) as unknown as SegmentHistory[];
const segmentLibrary = validateData('segment_library', segmentLibraryJson, baseArraySchema) as unknown as SegmentLibraryVersion[];
const studioOutputs = validateData('studio_outputs', studioOutputsJson, baseArraySchema) as unknown as StudioOutput[];
const changeEvents = validateData('change_events', changeEventsJson, baseArraySchema) as unknown as ChangeEvent[];
const driftFlags = validateData('drift_flags', driftFlagsJson, baseArraySchema) as unknown as DriftFlag[];
const proposals = validateData('proposals', proposalsJson, baseArraySchema) as unknown as Proposal[];
const auditLog = validateData('audit_log', auditLogJson, baseArraySchema) as unknown as AuditLogEntry[];
const publishLog = validateData('publish_log', publishLogJson, baseArraySchema) as unknown as PublishLogEntry[];
const downstreamImpact = validateData('downstream_impact', downstreamImpactJson, baseArraySchema) as unknown as DownstreamImpact[];
const recalibration = validateData('recalibration', recalibrationJson, baseArraySchema) as unknown as RecalibrationRecommendation[];
const vendorFileMktC = validateData('vendor_file_mkt_c', vendorFileMktCJson, baseArraySchema) as unknown as VendorFileRecord[];
const aiCache = aiCacheJson as Record<string, any>;

/**
 * Sorts any list to guarantee Hero records appear at the top.
 */
function sortByHero<T extends { hcp_id?: string; hco_id?: string; customer_id?: string; id?: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const idA = a.hcp_id || a.hco_id || a.customer_id || a.id || '';
    const idB = b.hcp_id || b.hco_id || b.customer_id || b.id || '';
    const idxA = HERO_RECORD_IDS.indexOf(idA);
    const idxB = HERO_RECORD_IDS.indexOf(idB);

    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });
}

/**
 * dataService: The single source of truth for all data queries across Continuum.
 */
export const dataService = {
  // Reference & Standards
  getMarkets: (): Market[] => [...markets],
  getMarketByCode: (code: MarketCode): Market | undefined => markets.find((m) => m.market_code === code),
  getBrands: (): Brand[] => [...brands],
  getBrandByCode: (code: BrandCode): Brand | undefined => brands.find((b) => b.brand_code === code),
  getPersonas: (): Persona[] => [...personas],
  getUsers: (): User[] => [...users],
  getAggregates: (marketCode: MarketCode | 'ALL' = 'ALL') => {
    return aggregates.markets[marketCode] || aggregates.markets.ALL;
  },
  getFullAggregatesData: (): AggregatesData => aggregates,
  getDimensions: (customerType?: CustomerType): Dimension[] => {
    if (!customerType) return [...dimensions];
    return dimensions.filter((d) => d.customer_type === customerType);
  },
  getApprovalRights: (market?: MarketCode, dimension?: DimensionCode): ApprovalRight[] => {
    let result = approvalRights;
    if (market) result = result.filter((r) => r.market_code === market);
    if (dimension) result = result.filter((r) => r.dimension_code === dimension);
    return result;
  },
  getThresholds: (market?: MarketCode, dimension?: DimensionCode): Threshold[] => {
    let result = thresholds;
    if (market) result = result.filter((t) => t.market_code === market);
    if (dimension) result = result.filter((t) => t.dimension_code === dimension);
    return result;
  },
  getStabilityPolicy: (market?: MarketCode): StabilityPolicy | MarketStabilityPolicy => {
    if (market && stabilityPolicy[market]) return stabilityPolicy[market];
    return stabilityPolicy;
  },
  getVocabularyMap: (market?: MarketCode): VocabularyMapEntry[] => {
    if (!market) return [...vocabularyMap];
    return vocabularyMap.filter((v) => v.market_code === market);
  },

  // Customer Master (HCPs & Accounts)
  getHcps: (filters?: {
    market?: MarketCode | 'ALL';
    brand?: BrandCode | 'ALL';
    specialty?: string;
    query?: string;
    limit?: number;
  }): HCP[] => {
    let list = [...hcps];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((h) => h.market_code === filters.market);
    }
    if (filters?.specialty) {
      list = list.filter((h) => h.specialty.toLowerCase().includes(filters.specialty!.toLowerCase()));
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (h) =>
          h.display_name.toLowerCase().includes(q) ||
          h.hcp_id.toLowerCase().includes(q) ||
          h.specialty.toLowerCase().includes(q)
      );
    }
    const sorted = sortByHero(list);
    return filters?.limit ? sorted.slice(0, filters.limit) : sorted;
  },

  getHcpById: (hcpId: string): HCP | undefined => {
    return hcps.find((h) => h.hcp_id === hcpId);
  },

  getAccounts: (filters?: {
    market?: MarketCode | 'ALL';
    archetype?: string;
    query?: string;
    limit?: number;
  }): Account[] => {
    let list = [...accounts];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((a) => a.market_code === filters.market);
    }
    if (filters?.archetype) {
      list = list.filter((a) => a.archetype === filters.archetype);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.hco_id.toLowerCase().includes(q)
      );
    }
    const sorted = sortByHero(list);
    return filters?.limit ? sorted.slice(0, filters.limit) : sorted;
  },

  getAccountById: (hcoId: string): Account | undefined => {
    return accounts.find((a) => a.hco_id === hcoId);
  },

  getAffiliations: (filters?: {
    hcpId?: string;
    hcoId?: string;
    market?: MarketCode;
  }): Affiliation[] => {
    let list = [...affiliations];
    if (filters?.hcpId) list = list.filter((a) => a.hcp_id === filters.hcpId);
    if (filters?.hcoId) list = list.filter((a) => a.hco_id === filters.hcoId);
    if (filters?.market) list = list.filter((a) => a.market_code === filters.market);
    return list;
  },

  getConsent: (hcpId: string): ConsentRecord[] => {
    return consent.filter((c) => c.hcp_id === hcpId);
  },

  /**
   * Sales query with Section 9.1 rule: Market C has NO HCP sales!
   */
  getSales: (filters?: {
    market?: MarketCode | 'ALL';
    brand?: BrandCode | 'ALL';
    entityId?: string;
  }): SalesQueryResult => {
    if (filters?.market === 'MKT_C') {
      return {
        available: false,
        proxy: 'rep assessment + PMR',
        data: [],
      };
    }
    let list = [...sales];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((s) => s.market_code === filters.market);
    }
    if (filters?.brand && filters.brand !== 'ALL') {
      list = list.filter((s) => s.brand_code === filters.brand);
    }
    if (filters?.entityId) {
      list = list.filter((s) => s.entity_id === filters.entityId);
    }
    return {
      available: true,
      data: list,
    };
  },

  getCrmActivity: (filters?: {
    hcpId?: string;
    hcoId?: string;
    brand?: BrandCode;
    market?: MarketCode;
  }): CrmActivity[] => {
    let list = [...crmActivity];
    if (filters?.hcpId) list = list.filter((c) => c.hcp_id === filters.hcpId);
    if (filters?.hcoId) list = list.filter((c) => c.hco_id === filters.hcoId);
    if (filters?.brand) list = list.filter((c) => c.brand_code === filters.brand);
    if (filters?.market) list = list.filter((c) => c.market_code === filters.market);
    return list;
  },

  getDigitalEngagement: (filters?: {
    hcpId?: string;
    brand?: BrandCode;
    market?: MarketCode;
  }): DigitalEngagement[] => {
    let list = [...digitalEngagement];
    if (filters?.hcpId) list = list.filter((d) => d.hcp_id === filters.hcpId);
    if (filters?.brand) list = list.filter((d) => d.brand_code === filters.brand);
    if (filters?.market) list = list.filter((d) => d.market_code === filters.market);
    return list;
  },

  getPmrResponses: (filters?: {
    hcpId?: string;
    brand?: BrandCode;
    market?: MarketCode;
  }): PmrResponse[] => {
    let list = [...pmrResponses];
    if (filters?.hcpId) list = list.filter((p) => p.hcp_id === filters.hcpId);
    if (filters?.brand) list = list.filter((p) => p.brand_code === filters.brand);
    if (filters?.market) list = list.filter((p) => p.market_code === filters.market);
    return list;
  },

  getFormularyStatus: (filters?: {
    hcoId?: string;
    brand?: BrandCode;
    market?: MarketCode;
  }): FormularyStatus[] => {
    let list = [...formularyStatus];
    if (filters?.hcoId) list = list.filter((f) => f.hco_id === filters.hcoId);
    if (filters?.brand) list = list.filter((f) => f.brand_code === filters.brand);
    if (filters?.market) list = list.filter((f) => f.market_code === filters.market);
    return list;
  },

  getKolInfluence: (filters?: { hcpId?: string; market?: MarketCode }): KolInfluence[] => {
    let list = [...kolInfluence];
    if (filters?.hcpId) list = list.filter((k) => k.hcp_id === filters.hcpId);
    if (filters?.market) list = list.filter((k) => k.market_code === filters.market);
    return list;
  },

  getRepNotes: (filters?: {
    hcpId?: string;
    hcoId?: string;
    brand?: BrandCode;
    market?: MarketCode;
  }): RepNote[] => {
    let list = [...repNotes];
    if (filters?.hcpId) list = list.filter((n) => n.hcp_id === filters.hcpId);
    if (filters?.hcoId) list = list.filter((n) => n.hco_id === filters.hcoId);
    if (filters?.brand) list = list.filter((n) => n.brand_code === filters.brand);
    if (filters?.market) list = list.filter((n) => n.market_code === filters.market);
    return list;
  },

  getFeatureStore: (filters?: { market?: MarketCode; category?: string }): FeatureStoreItem[] => {
    let list = [...featureStore];
    if (filters?.market) {
      list = list.filter((f) => f.availability[filters.market!] !== 'Not available');
    }
    if (filters?.category) {
      list = list.filter((f) => f.source_category === filters.category);
    }
    return list;
  },

  // Segmentation Studio & Library
  getSegmentAssignments: (filters?: {
    customerId?: string;
    market?: MarketCode;
    brand?: BrandCode;
    dimension?: DimensionCode;
  }): SegmentAssignment[] => {
    let list = [...segmentAssignments];
    if (filters?.customerId) list = list.filter((s) => s.customer_id === filters.customerId);
    if (filters?.market) list = list.filter((s) => s.market_code === filters.market);
    if (filters?.brand) list = list.filter((s) => s.brand_code === filters.brand);
    if (filters?.dimension) list = list.filter((s) => s.dimension_code === filters.dimension);
    return list;
  },

  getSegmentHistory: (filters?: {
    customerId?: string;
    brand?: BrandCode;
  }): SegmentHistory[] => {
    let list = [...segmentHistory];
    if (filters?.customerId) list = list.filter((s) => s.customer_id === filters.customerId);
    if (filters?.brand) list = list.filter((s) => s.brand_code === filters.brand);
    return list;
  },

  getSegmentLibrary: (filters?: {
    market?: MarketCode;
    brand?: BrandCode;
    status?: SegmentStatus;
  }): SegmentLibraryVersion[] => {
    let list = [...segmentLibrary];
    if (filters?.market) list = list.filter((v) => v.market_code === filters.market);
    if (filters?.brand) list = list.filter((v) => v.brand_code === filters.brand);
    if (filters?.status) list = list.filter((v) => v.status === filters.status);
    return list;
  },

  getStudioOutputs: (versionId?: string): StudioOutput[] => {
    if (!versionId) return [...studioOutputs];
    return studioOutputs.filter((s) => s.version_id === versionId);
  },

  // Living Loop: Changes & Proposals
  getChangeEvents: (filters?: {
    market?: MarketCode | 'ALL';
    brand?: BrandCode | 'ALL';
    customerId?: string;
    limit?: number;
  }): ChangeEvent[] => {
    let list = [...changeEvents];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((e) => e.market_code === filters.market);
    }
    if (filters?.brand && filters.brand !== 'ALL') {
      list = list.filter((e) => e.brand_code === filters.brand);
    }
    if (filters?.customerId) {
      list = list.filter((e) => e.customer_id === filters.customerId);
    }
    const sorted = sortByHero(list);
    return filters?.limit ? sorted.slice(0, filters.limit) : sorted;
  },

  getDriftFlags: (filters?: {
    market?: MarketCode | 'ALL';
    brand?: BrandCode | 'ALL';
    customerId?: string;
    limit?: number;
  }): DriftFlag[] => {
    let list = [...driftFlags];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((f) => f.market_code === filters.market);
    }
    if (filters?.brand && filters.brand !== 'ALL') {
      list = list.filter((f) => f.brand_code === filters.brand);
    }
    if (filters?.customerId) {
      list = list.filter((f) => f.customer_id === filters.customerId);
    }
    const sorted = sortByHero(list);
    return filters?.limit ? sorted.slice(0, filters.limit) : sorted;
  },

  getProposals: (filters?: {
    market?: MarketCode | 'ALL';
    brand?: BrandCode | 'ALL';
    status?: ProposalStatus | 'ALL';
    customerId?: string;
  }): Proposal[] => {
    let list = [...proposals];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((p) => p.market_code === filters.market);
    }
    if (filters?.brand && filters.brand !== 'ALL') {
      list = list.filter((p) => p.brand_code === filters.brand);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters?.customerId) {
      list = list.filter((p) => p.customer_id === filters.customerId);
    }
    return sortByHero(list);
  },

  // Audit, Governance & Publish Logs
  getAuditLog: (filters?: {
    market?: MarketCode | 'ALL';
    action?: string;
    limit?: number;
  }): AuditLogEntry[] => {
    let list = [...auditLog];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((a) => a.market_code === filters.market);
    }
    if (filters?.action) {
      list = list.filter((a) => a.action === filters.action);
    }
    return filters?.limit ? list.slice(0, filters.limit) : list;
  },

  getPublishLog: (filters?: { market?: MarketCode | 'ALL'; limit?: number }): PublishLogEntry[] => {
    let list = [...publishLog];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((p) => p.market_code === filters.market);
    }
    return filters?.limit ? list.slice(0, filters.limit) : list;
  },

  getDownstreamImpact: (filters?: {
    market?: MarketCode | 'ALL';
    brand?: BrandCode | 'ALL';
  }): DownstreamImpact[] => {
    let list = [...downstreamImpact];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((d) => d.market_code === filters.market);
    }
    if (filters?.brand && filters.brand !== 'ALL') {
      list = list.filter((d) => d.brand_code === filters.brand);
    }
    return list;
  },

  getRecalibrations: (filters?: {
    market?: MarketCode | 'ALL';
    dimension?: DimensionCode;
  }): RecalibrationRecommendation[] => {
    let list = [...recalibration];
    if (filters?.market && filters.market !== 'ALL') {
      list = list.filter((r) => r.market_code === filters.market);
    }
    if (filters?.dimension) {
      list = list.filter((r) => r.dimension_code === filters.dimension);
    }
    return list;
  },

  getVendorFileMktC: (): VendorFileRecord[] => [...vendorFileMktC],

  getAiCache: (task?: string, key?: string): any => {
    if (!task) return aiCache;
    if (!key) return aiCache[task];
    return aiCache[task]?.[key];
  },
};

export default dataService;
