/**
 * Continuum Data and Application Types
 * Aligned with DATA_SPEC.md and PROJECT_BRIEF.md (v2)
 */

export type MarketCode = 'MKT_A' | 'MKT_B' | 'MKT_C';
export type BrandCode = 'AUR' | 'ZEN' | 'CRD' | 'NEU' | 'BRV';
export type PersonaId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

export type CustomerType = 'HCP' | 'HCO';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type MaturityLevel = 'Data-rich' | 'Signal-enriched' | 'Survey-led';
export type LifecycleStage = 'Launch' | 'Growth' | 'Mature';
export type StudioMethod = 'KMEANS_RULES' | 'RULES_DECILE_CLUSTERS' | 'RULES_TEMPLATE' | 'KMEANS' | 'RULES' | 'HYBRID';
export type RefreshCadence = 'Quarterly' | 'Annual';

export type SegmentStatus = 'Draft' | 'Approved' | 'Active' | 'Retired';
export type ProposalStatus = 'Proposed' | 'Held' | 'Approved' | 'Rejected' | 'Written back';
export type HoldReason = 'Conflicting signals' | 'Freeze window' | 'Change-frequency limit' | 'Insufficient evidence';
export type RejectionReason =
  | 'Field knowledge contradicts signal'
  | 'Temporary behaviour'
  | 'Data quality issue'
  | 'Freeze period'
  | 'Other';

export type DimensionCode =
  | 'SEGMENT'
  | 'POTENTIAL'
  | 'ADOPTION'
  | 'BEHAVIOURAL'
  | 'ATTITUDINAL'
  | 'DIGITAL'
  | 'CHANNEL_PREF'
  | 'MICRO_SEGMENT'
  | 'ACC_ARCHETYPE'
  | 'ACC_POTENTIAL'
  | 'ACCESS_STATUS'
  | 'DECISION_MODEL'
  | 'TREATMENT_CAP'
  | 'ACC_TIER';

export interface Market {
  market_code: MarketCode;
  display_name: string;
  maturity_level: MaturityLevel;
  profile: string;
  current_process: string;
  current_tool: string;
  studio_method: StudioMethod;
  refresh_cadence: RefreshCadence;
  refresh_cycles_per_year: number;
  manual_hours_per_refresh: number;
  vendor_dependent: boolean;
  on_global_standard: boolean;
  brands: BrandCode[];
  hcp_universe: number;
  account_universe: number;
  currency_note: string;
}

export interface BrandIndication {
  indication_code: string;
  name: string;
}

export interface Brand {
  brand_code: BrandCode;
  brand_name: string;
  therapy_area: string;
  lifecycle: LifecycleStage;
  launch_date: string;
  indications: BrandIndication[];
  markets: MarketCode[];
  key_specialties: string[];
}

export interface Persona {
  persona_id: PersonaId;
  persona_name: string;
  user_id: string;
  market_scope: MarketCode | 'ALL';
  landing_screen: string;
  visible_screens: string[];
  label_overrides: Record<string, string>;
  can_approve_dimensions: DimensionCode[];
}

export interface User {
  user_id: string;
  name: string;
  persona_id: PersonaId;
  market_code: MarketCode | 'ALL';
  territory_id: string | null;
  agency_name: string | null;
}

export interface Dimension {
  dimension_code: DimensionCode;
  customer_type: CustomerType;
  name: string;
  captured_per: 'brand_indication' | 'brand' | 'customer' | 'brand_market';
  allowed_values: string[];
  layer: 'Strategic' | 'Priority';
  refreshable_between_cycles: boolean;
  global_fixed: boolean;
  market_configurable: string[];
  version: string;
  effective_from: string;
}

export interface ApprovalRight {
  market_code: MarketCode;
  dimension_code: DimensionCode;
  maintained_by_today: string;
  approver_role: PersonaId;
  ai_role: 'Propose' | 'Detect drift' | 'Infer and suggest' | 'Refresh between waves' | 'Flag for review';
  never: string;
  co_approver_role: PersonaId | null;
}

export interface Threshold {
  market_code: MarketCode;
  dimension_code: DimensionCode;
  signal_type: string;
  threshold_value: string;
  unit: string;
  min_independent_signals: number;
  min_confidence: ConfidenceLevel;
  lookback_days: number;
}

export interface FreezeWindow {
  name: string;
  start: string;
  end: string;
}

export interface MarketStabilityPolicy {
  max_changes_per_customer_per_180d: number;
  freeze_windows: FreezeWindow[];
  conflict_rule: string;
  min_days_between_changes: number;
  stable_dimensions: DimensionCode[];
}

export type StabilityPolicy = Record<MarketCode, MarketStabilityPolicy>;

export interface VocabularyMapEntry {
  market_code: MarketCode;
  source: 'Studio' | 'Vendor' | 'Legacy tool';
  source_dimension: string;
  source_value: string;
  global_dimension: DimensionCode;
  global_value: string;
  mapped_by: 'AI' | 'User';
  confidence: number;
  status: 'Accepted' | 'Pending' | 'Rejected';
}

export interface HCP {
  hcp_id: string;
  market_code: MarketCode;
  first_name: string;
  last_name: string;
  display_name: string;
  hcp_type: 'Specialist' | 'GP' | 'NP/PA';
  specialty: string;
  years_in_practice: number;
  gender: 'F' | 'M';
  region: string;
  urbanicity: 'Urban' | 'Suburban' | 'Rural';
  practice_type: 'Hospital' | 'Private clinic' | 'Group practice' | 'Academic';
  territory_id: string;
  brick_id: string | null;
  primary_hco_id: string | null;
  rep_user_id: string | null;
  kol_flag: boolean;
  in_customer_master: boolean;
  created_date: string;
}

export interface Account {
  hco_id: string;
  market_code: MarketCode;
  name: string;
  archetype: string;
  hco_type: 'Hospital' | 'Clinic' | 'IDN' | 'Specialty centre' | 'Pharmacy chain';
  region: string;
  urbanicity: 'Urban' | 'Suburban' | 'Rural';
  beds: number | null;
  annual_patient_volume_ta: Record<BrandCode, number>;
  affiliated_hcp_count: number;
  kam_user_id: string;
  procurement_model: 'Central tender' | 'Local formulary' | 'Direct purchase';
  treatment_capability: string;
  decision_model: string;
}

export interface Affiliation {
  hcp_id: string;
  hco_id: string;
  market_code: MarketCode;
  affiliation_type: 'Primary' | 'Secondary';
  weight: number;
  start_date: string;
}

export interface ConsentRecord {
  hcp_id: string;
  market_code: MarketCode;
  channel: 'Email' | 'Portal' | 'Remote' | 'Events' | 'Face-to-face';
  consent_status: 'Granted' | 'Withdrawn' | 'Not captured';
  updated_date: string;
}

export interface SalesRecord {
  market_code: MarketCode;
  granularity: 'HCP' | 'BRICK' | 'ACCOUNT_SELLIN';
  entity_id: string;
  brand_code: BrandCode;
  period: string;
  trx: number | null;
  nrx: number | null;
  nbrx: number | null;
  units: number;
  value_usd: number;
  market_share: number | null;
}

export interface CrmActivity {
  activity_id: string;
  market_code: MarketCode;
  hcp_id: string;
  hco_id: string | null;
  brand_code: BrandCode;
  date: string;
  channel: 'F2F' | 'Remote' | 'Email-rep' | 'Event';
  outcome: 'Completed' | 'Declined' | 'No show';
  samples_given: number;
  call_plan_flag: boolean;
  rep_user_id: string;
}

export interface DigitalEngagement {
  market_code: MarketCode;
  hcp_id: string;
  brand_code: BrandCode;
  month: string;
  portal_visits: number;
  email_opens: number;
  email_clicks: number;
  webinar_attended: number;
  content_minutes: number;
}

export interface PmrResponse {
  response_id: string;
  market_code: MarketCode;
  hcp_id: string;
  brand_code: BrandCode;
  wave: '2025-W2' | '2026-W1' | '2026-W2';
  wave_date: string;
  attitudinal_segment: string;
  behavioural_segment: string;
  likelihood_to_prescribe: number;
  unmet_need_score: number;
}

export interface FormularyStatus {
  hco_id: string;
  market_code: MarketCode;
  brand_code: BrandCode;
  status: 'Listed' | 'Restricted' | 'Under review' | 'Not listed';
  effective_date: string;
  previous_status: string;
  source: 'Tender' | 'P&T committee' | 'Regional formulary';
}

export interface KolInfluence {
  hcp_id: string;
  market_code: MarketCode;
  therapy_area: string;
  influence_score: number;
  publications_3y: number;
  congress_talks_3y: number;
  network_degree: number;
}

export interface ExtractedSignal {
  dimension_code: DimensionCode;
  direction: 'Up' | 'Down' | 'None';
  proposed_value: string;
  evidence_quote: string;
  confidence: ConfidenceLevel;
}

export interface RepNote {
  note_id: string;
  market_code: MarketCode;
  hcp_id: string;
  hco_id: string;
  rep_user_id: string;
  date: string;
  brand_code: BrandCode;
  text: string;
  ai_extracted: boolean;
  extracted_signals: ExtractedSignal[];
}

export interface FeatureStoreItem {
  feature_id: string;
  feature_name: string;
  description: string;
  source_category: 'Survey' | 'CRM' | 'Sales' | 'Claims & access' | 'Digital' | 'Reference';
  granularity: string;
  refresh_frequency: string;
  availability: Record<MarketCode, 'Available' | 'Partial' | 'Not available'>;
  data_age_days: Record<MarketCode, number | null>;
  used_by_dimensions: DimensionCode[];
}

export interface SegmentAssignment {
  market_code: MarketCode;
  customer_type: CustomerType;
  customer_id: string;
  brand_code: BrandCode;
  indication_code: string | null;
  dimension_code: DimensionCode;
  value: string;
  set_date: string;
  set_by: 'Model' | 'Back office' | 'Rep' | 'Agency file' | 'KAM';
  source_version_id: string;
  confidence: ConfidenceLevel;
  gap_filled: boolean;
}

export interface SegmentHistory {
  history_id: string;
  customer_id: string;
  customer_type: CustomerType;
  brand_code: BrandCode;
  dimension_code: DimensionCode;
  value: string;
  valid_from: string;
  valid_to: string | null;
  change_reason: 'Annual refresh' | 'Bulk refresh' | 'Approved proposal' | 'Override' | 'Agency file';
  approver_user_id: string | null;
}

export interface SegmentLibraryVersion {
  version_id: string;
  name: string;
  market_code: MarketCode;
  brand_code: BrandCode;
  customer_type: CustomerType;
  method: StudioMethod;
  parameters: {
    k?: number;
    features?: string[];
    weights?: Record<string, number>;
    filters?: Record<string, unknown>;
  };
  status: SegmentStatus;
  author_user_id: string;
  created_date: string;
  approved_by: string | null;
  approved_date: string | null;
  activated_date: string | null;
  records_segmented: number;
  mapped_to_global: boolean;
  notes: string;
}

export interface ClusterBoxStat {
  feature: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface StudioClusterOutput {
  cluster_id: string;
  cluster_size: number;
  centroid: Record<string, number>;
  feature_importance: Array<{ feature: string; importance: number }>;
  box_stats: ClusterBoxStat[];
  suggested_name: string;
  suggested_global_value: string;
}

export interface StudioOutput {
  version_id: string;
  clusters: StudioClusterOutput[];
  before_after_counts: Array<{ from: string; to: string; count: number }>;
}

export interface ChangeEvent {
  event_id: string;
  market_code: MarketCode;
  customer_type: CustomerType;
  customer_id: string;
  brand_code: BrandCode;
  signal_type:
    | 'Sales trend'
    | 'Rx trend'
    | 'Digital engagement'
    | 'PMR wave'
    | 'Rep note'
    | 'Formulary change'
    | 'CRM activity'
    | 'Affiliation change';
  source_category: string;
  detected_by: 'Agent' | 'GenAI';
  detected_at: string;
  magnitude: string;
  direction: 'Up' | 'Down';
  description: string;
  data_age_days: number;
  led_to_drift_flag: boolean;
}

export interface DriftFlag {
  flag_id: string;
  market_code: MarketCode;
  customer_type: CustomerType;
  customer_id: string;
  brand_code: BrandCode;
  dimension_code: DimensionCode;
  current_value: string;
  indicated_value: string;
  drift_score: number;
  confidence: ConfidenceLevel;
  threshold_ref: string;
  supporting_event_ids: string[];
  independent_signal_count: number;
  model_version: string;
  flagged_at: string;
}

export interface ProposalDriver {
  label: string;
  value: string;
  source_category: string;
  data_age_days: number;
}

export interface Proposal {
  proposal_id: string;
  market_code: MarketCode;
  customer_type: CustomerType;
  customer_id: string;
  brand_code: BrandCode;
  indication_code: string | null;
  dimension_code: DimensionCode;
  current_value: string;
  proposed_value: string;
  segment_age_days: number;
  confidence: ConfidenceLevel;
  drivers: ProposalDriver[];
  flag_ids: string[];
  origin: 'Event-driven' | 'Bulk refresh' | 'Propagation';
  origin_ref: string | null;
  approver_role: PersonaId;
  approver_user_id: string;
  status: ProposalStatus;
  hold_reason: HoldReason | null;
  policy_rule_ref: string | null;
  explanation_key: string;
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
  decision_reason: RejectionReason | string | null;
}

export interface AuditLogEntry {
  audit_id: string;
  timestamp: string;
  market_code: MarketCode;
  actor_user_id: string;
  actor_persona: PersonaId;
  action:
    | 'Proposal approved'
    | 'Proposal rejected'
    | 'Proposal held'
    | 'Written back'
    | 'Version approved'
    | 'Version activated'
    | 'Threshold changed'
    | 'Mapping accepted'
    | 'Recalibration approved';
  entity_type: string;
  entity_id: string;
  before_value: string;
  after_value: string;
  reason: string;
  evidence_refs: string[];
}

export interface PublishLogEntry {
  publish_id: string;
  market_code: MarketCode;
  version_id: string;
  published_at: string;
  published_by: string;
  records_written: number;
  target_systems: string[];
  status: 'Success' | 'Partial';
}

export interface DownstreamImpact {
  market_code: MarketCode;
  brand_code: BrandCode;
  consumer: 'Targeting' | 'Call planning' | 'Next-best-action' | 'Journeys' | 'Segment-health dashboard';
  metric: string;
  before: number;
  after: number;
  period: string;
}

export interface RecalibrationRecommendation {
  recommendation_id: string;
  market_code: MarketCode;
  dimension_code: DimensionCode;
  issue: string;
  evidence: {
    rejections: number;
    rejection_rate: number;
    top_reason: string;
    override_rate_before: number;
    override_rate_after: number;
    coverage_of_rising_customers: number;
  };
  recommendation: string;
  status: 'Recommended' | 'Under validation' | 'Approved' | 'Declined';
  model_owner_user_id: string;
}

export interface MarketAggregate {
  hcp_universe: number;
  account_universe: number;
  segment_age: {
    median_days: number;
    pct_stale_180: number;
    histogram: Array<{ range: string; count: number }>;
  };
  segment_mix: Record<BrandCode, Record<string, number>>;
  data_quality: {
    hcp_match_rate: number;
    duplicate_rate: number;
    pct_primary_affiliation: number;
  };
  pipeline_30d: {
    change_events: number;
    drift_flags: number;
    explanations: number;
    proposals: number;
    held: number;
    approved: number;
    rejected: number;
    written_back: number;
  };
  time_to_update_days: {
    baseline: number;
    current: number;
  };
  override_rate: {
    before: number;
    after: number;
  };
  acceptance_rate: number;
  approval_cycle_days: number;
  standardisation: {
    on_global_standard: boolean;
    conformance: number;
  };
}

export interface AggregatesData {
  as_of: string;
  markets: Record<MarketCode | 'ALL', MarketAggregate>;
  value_levers: {
    rising_opp_upgraded_hcps: number;
    rising_opp_weeks_earlier: number;
    rising_opp_value_per_week: number;
    declining_effort_calls: number;
    declining_effort_cost_per_interaction: number;
    field_acceptance_override_before: number;
    field_acceptance_override_after: number;
    field_acceptance_planned_calls: number;
    field_acceptance_value_per_call: number;
    maintenance_hourly_rate: number;
    maintenance_savings_pct: number;
  };
}

export interface CrmRecord {
  customer_id: string;
  customer_type: CustomerType;
  market_code: MarketCode;
  brand_code: BrandCode;
  customer_name: string;
  specialty?: string;
  account_name?: string;
  segment: string;
  proposed_segment: string | null;
  segment_age_days: number;
  last_sync_date: string;
  sync_status: 'Synced' | 'Pending publish' | 'Modified locally';
}

export interface VendorFileRecord {
  Ref_No?: string;
  Local_ID?: string;
  Dr_Name?: string;
  Doctor_Name?: string;
  Spec?: string;
  Specialty?: string;
  Clinic?: string;
  Primary_Hospital?: string;
  City?: string;
  Region?: string;
  Pot_Class?: string;
  PMR_Potential_Score?: number;
  Segmen?: string;
  Local_Segment_Label?: string;
  Adopt?: string;
  Rep_Stated_Adoption?: string;
  Last_Visit?: string;
  Remarks?: string;
}

export interface SalesQueryResult {
  available: boolean;
  proxy?: string;
  data: SalesRecord[];
}

