import dataService from './dataService';
import { appConfig } from '../config/appConfig';
import { getDaysRelativeToDemo } from '../utils/formatters';
import { BrandCode, MarketCode, Proposal, SegmentAssignment } from '../types';

/**
 * Segment Insights (S08) derivations.
 *
 * Every figure is computed from the row-level sample in /data, overlaid with proposals that have
 * been written back to CRM in this session, so the insights move when the living loop publishes.
 * Sample counts are scaled per market to the full universe in aggregates.json (brief Section 9.1).
 */

export const SEGMENTS = ['A', 'B', 'C', 'D', 'E'] as const;
export type SegmentCode = (typeof SEGMENTS)[number];

const MARKETS: MarketCode[] = ['MKT_A', 'MKT_B', 'MKT_C'];
const SEGMENT_RANK: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };

// Matrix columns collapse the six global adoption stages into four
export const MATRIX_STAGES = ['Awareness', 'Consideration', 'Trial', 'Adoption'] as const;
const STAGE_TO_MATRIX: Record<string, (typeof MATRIX_STAGES)[number]> = {
  Unaware: 'Awareness',
  Aware: 'Awareness',
  Consideration: 'Consideration',
  Trial: 'Trial',
  Adoption: 'Adoption',
  Expansion: 'Adoption',
};

// Illustrative call-allocation weights per segment used for the living targeting recommendation
export const CALL_ALLOCATION_WEIGHTS: Record<SegmentCode, number> = { A: 5, B: 4, C: 2, D: 1, E: 0.25 };

const LOOKBACK_CALLS_FROM = '2026-07-17'; // 90 days before demo today
const LOOKBACK_DIGITAL_FROM_MONTH = '2026-05'; // last 6 months

export interface InsightsScope {
  market: MarketCode | 'ALL';
  brand: BrandCode;
}

/** Customer → dimension → value for one brand, after written-back proposals are applied. */
type DimensionValues = Record<string, string>;

interface CustomerView {
  customerId: string;
  market: MarketCode;
  weight: number;
  base: DimensionValues;
  current: DimensionValues;
  setDates: Record<string, string>;
}

const allowedValues = (): Record<string, string[]> =>
  Object.fromEntries(dataService.getDimensions().map((d) => [d.dimension_code, d.allowed_values]));

/** Scale factor per market: full universe ÷ customers in the row sample for that brand. */
function marketWeights(brand: BrandCode, customerType: 'HCP' | 'HCO'): Record<MarketCode, number> {
  const weights = {} as Record<MarketCode, number>;
  const dimension = customerType === 'HCP' ? 'SEGMENT' : 'ACC_TIER';
  MARKETS.forEach((m) => {
    const sample = dataService
      .getSegmentAssignments({ market: m, brand, dimension })
      .filter((a) => a.customer_type === customerType).length;
    const agg = dataService.getAggregates(m);
    const universe = customerType === 'HCP' ? agg.hcp_universe : agg.account_universe;
    weights[m] = sample > 0 ? universe / sample : 0;
  });
  return weights;
}

/** Written-back proposals, keyed customer|dimension, restricted to values in the global vocabulary. */
function writtenBackValues(proposals: Proposal[], brand: BrandCode): Map<string, string> {
  const allowed = allowedValues();
  const map = new Map<string, string>();
  proposals
    .filter((p) => p.status === 'Written back' && p.brand_code === brand)
    .filter((p) => (allowed[p.dimension_code] || []).includes(p.proposed_value))
    .forEach((p) => map.set(`${p.customer_id}|${p.dimension_code}`, p.proposed_value));
  return map;
}

export function buildCustomerViews(
  scope: InsightsScope,
  proposals: Proposal[],
  customerType: 'HCP' | 'HCO' = 'HCP'
): CustomerView[] {
  const weights = marketWeights(scope.brand, customerType);
  const overlay = writtenBackValues(proposals, scope.brand);
  const byCustomer = new Map<string, CustomerView>();

  dataService
    .getSegmentAssignments({ brand: scope.brand })
    .filter(
      (a: SegmentAssignment) =>
        a.customer_type === customerType && (scope.market === 'ALL' || a.market_code === scope.market)
    )
    .forEach((a) => {
      let view = byCustomer.get(a.customer_id);
      if (!view) {
        view = { customerId: a.customer_id, market: a.market_code, weight: weights[a.market_code], base: {}, current: {}, setDates: {} };
        byCustomer.set(a.customer_id, view);
      }
      const published = overlay.get(`${a.customer_id}|${a.dimension_code}`);
      view.base[a.dimension_code] = a.value;
      view.current[a.dimension_code] = published ?? a.value;
      view.setDates[a.dimension_code] = published ? appConfig.demoToday : a.set_date;
    });

  return [...byCustomer.values()];
}

const sumWeights = (views: CustomerView[]) => views.reduce((acc, v) => acc + v.weight, 0);

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

const sharesOf = (views: CustomerView[], dimension: string): Array<{ value: string; share: number }> => {
  const total = sumWeights(views);
  const totals = new Map<string, number>();
  views.forEach((v) => {
    const value = v.current[dimension];
    if (value) totals.set(value, (totals.get(value) || 0) + v.weight);
  });
  return [...totals.entries()]
    .map(([value, w]) => ({ value, share: total > 0 ? w / total : 0 }))
    .sort((a, b) => b.share - a.share);
};

// ---------- 1. Profiles ----------

export interface SegmentProfile {
  code: SegmentCode;
  share: number;
  count: number;
  sampleSize: number;
  avgPotential: number;
  adoptingShare: number;
  trialShare: number;
  earlierShare: number;
  topChannels: Array<{ value: string; share: number }>;
  medianAgeDays: number;
}

export function computeProfiles(views: CustomerView[]): SegmentProfile[] {
  const total = sumWeights(views);
  return SEGMENTS.map((code) => {
    const inSeg = views.filter((v) => v.current.SEGMENT === code);
    const w = sumWeights(inSeg);
    const stageShare = (stages: string[]) =>
      w > 0 ? sumWeights(inSeg.filter((v) => stages.includes(v.current.ADOPTION))) / w : 0;
    const potentialSum = inSeg.reduce((acc, v) => acc + v.weight * Number(v.current.POTENTIAL || 0), 0);
    return {
      code,
      share: total > 0 ? w / total : 0,
      count: Math.round(w),
      sampleSize: inSeg.length,
      avgPotential: w > 0 ? potentialSum / w : 0,
      adoptingShare: stageShare(['Adoption', 'Expansion']),
      trialShare: stageShare(['Trial']),
      earlierShare: stageShare(['Unaware', 'Aware', 'Consideration']),
      topChannels: sharesOf(inSeg, 'CHANNEL_PREF').slice(0, 3),
      medianAgeDays: median(inSeg.map((v) => getDaysRelativeToDemo(v.setDates.SEGMENT))),
    };
  });
}

// ---------- 2. Opportunity matrix ----------

export interface OpportunityCell {
  potential: string; // '4' (high) … '1' (low), as stored in segment_assignments
  adoptionStage: (typeof MATRIX_STAGES)[number];
  count: number;
  isOpportunityGap: boolean;
}

export interface OpportunitySummary {
  cells: OpportunityCell[];
  gapCount: number;
  gapUncontacted: number;
  gapAtListedAccounts: number;
}

// DATA_SPEC 10.1: opportunity gap = Potential 3–4 and Adoption ≤ Consideration
const isGap = (v: CustomerView) =>
  ['3', '4'].includes(v.current.POTENTIAL) && ['Awareness', 'Consideration'].includes(STAGE_TO_MATRIX[v.current.ADOPTION]);

export function computeOpportunity(views: CustomerView[], scope: InsightsScope): OpportunitySummary {
  const cells: OpportunityCell[] = [];
  ['4', '3', '2', '1'].forEach((potential) => {
    MATRIX_STAGES.forEach((stage) => {
      const match = views.filter((v) => v.current.POTENTIAL === potential && STAGE_TO_MATRIX[v.current.ADOPTION] === stage);
      cells.push({
        potential,
        adoptionStage: stage,
        count: Math.round(sumWeights(match)),
        isOpportunityGap: ['3', '4'].includes(potential) && (stage === 'Awareness' || stage === 'Consideration'),
      });
    });
  });

  const gap = views.filter(isGap);
  const contacted = new Set(
    dataService
      .getCrmActivity({ brand: scope.brand })
      .filter((c) => c.date >= LOOKBACK_CALLS_FROM && c.outcome === 'Completed' && (c.channel === 'F2F' || c.channel === 'Remote'))
      .map((c) => c.hcp_id)
  );
  const listedAccounts = new Set(
    dataService
      .getFormularyStatus({ brand: scope.brand })
      .filter((f) => f.status === 'Listed')
      .map((f) => f.hco_id)
  );
  const primaryHco = new Map(dataService.getHcps().map((h) => [h.hcp_id, h.primary_hco_id]));

  return {
    cells,
    gapCount: Math.round(sumWeights(gap)),
    gapUncontacted: Math.round(sumWeights(gap.filter((v) => !contacted.has(v.customerId)))),
    gapAtListedAccounts: Math.round(
      sumWeights(gap.filter((v) => listedAccounts.has(primaryHco.get(v.customerId) || '')))
    ),
  };
}

// ---------- 3. Migration ----------

export interface MigrationSummary {
  flows: Array<{ from: SegmentCode; to: SegmentCode; count: number }>;
  upgraded: number;
  downgraded: number;
  stabilityIndex: number;
}

/** Base (planning-cycle) segment → current segment after written-back living changes. */
export function computeMigration(views: CustomerView[]): MigrationSummary {
  const flowWeights = new Map<string, number>();
  let up = 0;
  let down = 0;
  views.forEach((v) => {
    const from = v.base.SEGMENT;
    const to = v.current.SEGMENT;
    if (!from || !to) return;
    flowWeights.set(`${from}>${to}`, (flowWeights.get(`${from}>${to}`) || 0) + v.weight);
    if (SEGMENT_RANK[to] > SEGMENT_RANK[from]) up += v.weight;
    if (SEGMENT_RANK[to] < SEGMENT_RANK[from]) down += v.weight;
  });
  const total = sumWeights(views);
  const flows = [...flowWeights.entries()].map(([key, w]) => {
    const [from, to] = key.split('>') as [SegmentCode, SegmentCode];
    return { from, to, count: Math.max(1, Math.round(w)) };
  });
  return {
    flows,
    upgraded: Math.round(up),
    downgraded: Math.round(down),
    stabilityIndex: total > 0 ? 1 - (up + down) / total : 1,
  };
}

// ---------- 4. Accounts ----------

export interface AccountInsightRow {
  id: string;
  name: string;
  market: MarketCode;
  archetype: string;
  tier: string;
  accessStatus: string;
  affiliatedHcps: number;
  segmentAge: number;
  potential: number;
}

export function computeAccountRows(scope: InsightsScope, proposals: Proposal[]): AccountInsightRow[] {
  const views = new Map(buildCustomerViews(scope, proposals, 'HCO').map((v) => [v.customerId, v]));
  const formulary = dataService.getFormularyStatus({ brand: scope.brand });
  const affiliations = dataService.getAffiliations();
  return dataService.getAccounts({ market: scope.market }).map((acc) => {
    const view = views.get(acc.hco_id);
    const access =
      view?.current.ACCESS_STATUS || formulary.find((f) => f.hco_id === acc.hco_id)?.status || 'Not listed';
    return {
      id: acc.hco_id,
      name: acc.name,
      market: acc.market_code,
      archetype: view?.current.ACC_ARCHETYPE || acc.archetype,
      tier: view?.current.ACC_TIER || 'Unassigned',
      accessStatus: access,
      affiliatedHcps: affiliations.filter((af) => af.hco_id === acc.hco_id).length || acc.affiliated_hcp_count,
      segmentAge: view ? getDaysRelativeToDemo(view.setDates.ACC_TIER) : 0,
      potential: Number(view?.current.ACC_POTENTIAL || 0),
    };
  });
}

// ---------- 5. Cross-market ----------

export interface CrossMarketEntry {
  market: MarketCode;
  available: boolean;
  segments: Array<{ code: SegmentCode; localLabel: string | null; share: number; avgPotential: number }>;
}

export function computeCrossMarket(brand: BrandCode, proposals: Proposal[]): CrossMarketEntry[] {
  return MARKETS.map((market) => {
    const views = buildCustomerViews({ market, brand }, proposals);
    const vocab = dataService.getVocabularyMap(market).filter((v) => v.global_dimension === 'SEGMENT');
    const profiles = computeProfiles(views);
    return {
      market,
      available: views.length > 0,
      segments: (['A', 'B'] as SegmentCode[]).map((code) => {
        const profile = profiles.find((p) => p.code === code);
        return {
          code,
          localLabel: vocab.find((v) => v.global_value === code)?.source_value ?? null,
          share: profile?.share ?? 0,
          avgPotential: profile?.avgPotential ?? 0,
        };
      }),
    };
  });
}

// ---------- 6. Channel affinity ----------

export const AFFINITY_CHANNELS = [
  { id: 'f2f', label: 'In-Person Detailing' },
  { id: 'remote', label: 'Remote Detailing' },
  { id: 'email', label: 'Rep Email' },
  { id: 'portal', label: 'Self-Serve Portal' },
  { id: 'webinar', label: 'Webinar' },
] as const;
export type AffinityChannel = (typeof AFFINITY_CHANNELS)[number]['id'];

export interface AffinityCell {
  segment: SegmentCode;
  channel: AffinityChannel;
  reachPct: number;
}

/** Share of HCPs in each segment engaged at least once through each channel (calls: 90d, digital: 6 months). */
export function computeChannelAffinity(views: CustomerView[], scope: InsightsScope): AffinityCell[] {
  const engaged: Record<AffinityChannel, Set<string>> = {
    f2f: new Set(),
    remote: new Set(),
    email: new Set(),
    portal: new Set(),
    webinar: new Set(),
  };
  dataService
    .getCrmActivity({ brand: scope.brand })
    .filter((c) => c.date >= LOOKBACK_CALLS_FROM && c.outcome === 'Completed')
    .forEach((c) => {
      if (c.channel === 'F2F') engaged.f2f.add(c.hcp_id);
      if (c.channel === 'Remote') engaged.remote.add(c.hcp_id);
      if (c.channel === 'Email-rep') engaged.email.add(c.hcp_id);
    });
  dataService
    .getDigitalEngagement({ brand: scope.brand })
    .filter((d) => d.month >= LOOKBACK_DIGITAL_FROM_MONTH)
    .forEach((d) => {
      if (d.portal_visits > 0) engaged.portal.add(d.hcp_id);
      if (d.webinar_attended > 0) engaged.webinar.add(d.hcp_id);
    });

  const cells: AffinityCell[] = [];
  SEGMENTS.forEach((segment) => {
    const inSeg = views.filter((v) => v.current.SEGMENT === segment);
    const w = sumWeights(inSeg);
    AFFINITY_CHANNELS.forEach(({ id }) => {
      const reached = sumWeights(inSeg.filter((v) => engaged[id].has(v.customerId)));
      cells.push({ segment, channel: id, reachPct: w > 0 ? Math.round((reached / w) * 100) : 0 });
    });
  });
  return cells;
}

// ---------- 7. Targeting alignment ----------

export interface TargetingSummary {
  rows: Array<{ segment: SegmentCode; currentCalls: number; recommendedCalls: number }>;
  abShareCurrent: number;
  abShareRecommended: number;
  callsRedirectedFromDE: number;
  downstreamConsumers: string[];
}

/**
 * Current = completed F2F/remote calls in the last 90 days by current segment (scaled to universe).
 * Recommended = the same call capacity re-allocated by segment size × CALL_ALLOCATION_WEIGHTS.
 */
export function computeTargeting(views: CustomerView[], scope: InsightsScope): TargetingSummary {
  const segmentOf = new Map(views.map((v) => [v.customerId, v]));
  const current: Record<SegmentCode, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  dataService
    .getCrmActivity({ brand: scope.brand })
    .filter((c) => c.date >= LOOKBACK_CALLS_FROM && c.outcome === 'Completed' && (c.channel === 'F2F' || c.channel === 'Remote'))
    .forEach((c) => {
      const view = segmentOf.get(c.hcp_id);
      const seg = view?.current.SEGMENT as SegmentCode | undefined;
      if (view && seg && seg in current) current[seg] += view.weight;
    });

  const capacity = SEGMENTS.reduce((acc, s) => acc + current[s], 0);
  const demand = SEGMENTS.map((s) => sumWeights(views.filter((v) => v.current.SEGMENT === s)) * CALL_ALLOCATION_WEIGHTS[s]);
  const demandTotal = demand.reduce((a, b) => a + b, 0);

  const rows = SEGMENTS.map((segment, i) => ({
    segment,
    currentCalls: Math.round(current[segment]),
    recommendedCalls: demandTotal > 0 ? Math.round((capacity * demand[i]) / demandTotal) : 0,
  }));
  const share = (key: 'currentCalls' | 'recommendedCalls') => {
    const total = rows.reduce((acc, r) => acc + r[key], 0);
    return total > 0 ? (rows[0][key] + rows[1][key]) / total : 0;
  };
  const de = (key: 'currentCalls' | 'recommendedCalls') => rows[3][key] + rows[4][key];

  return {
    rows,
    abShareCurrent: share('currentCalls'),
    abShareRecommended: share('recommendedCalls'),
    callsRedirectedFromDE: Math.max(0, de('currentCalls') - de('recommendedCalls')),
    downstreamConsumers: [
      ...new Set(dataService.getDownstreamImpact({ market: scope.market, brand: scope.brand }).map((d) => d.consumer)),
    ],
  };
}
