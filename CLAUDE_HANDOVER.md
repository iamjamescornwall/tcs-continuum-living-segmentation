# Continuum (v2) — Master Handover & Research Brief for Claude

> **Project:** Continuum (v2) — Governed, Living Customer Segmentation Across Every Market  
> **Repository:** `https://github.com/iamjamescornwall/tcs-continuum-living-segmentation`  
> **Category:** Enterprise Commercial Analytics Application for Life Sciences / Pharmaceuticals  
> **Status:** Fully built, 100% verified, 64/64 automated tests passing, 0 TypeScript errors.

---

## 1. Executive Summary & Positioning

**Tagline:** *Governed, living segmentation across every market.*  
**Positioning Statement:**  
> *"Analyst workbenches build segments. Continuum runs segmentation as a governed global process — every market, every data reality, from studio to CRM."*

### What Continuum Does
Continuum solves a fundamental problem in global pharmaceutical commercial operations:
1. **Unifies Fragmented Market Methodologies:** Harmonizes disjointed market practices (Python machine-learning models in Market A, annual consulting agency deciles in Market B, local agency survey spreadsheets in Market C) into **one standardized global segmentation vocabulary**.
2. **Maintains Living Segments Between Planning Cycles:** Rather than letting segments freeze for 12 months, Continuum continuously watches real-world signals (claims, CRM rep notes, hospital formulary approvals, digital engagement), detects drift, generates AI-grounded explanations, routes proposals to named commercial owners, and writes approved changes back to CRM.
3. **Enterprise Governance & Proving ROI:** Provides continuous segment health monitoring, an immutable audit trail, controlled algorithmic recalibration (no black-box auto-retraining), demographic fairness checks, and financial ROI tracking.

---

## 2. Non-Negotiable Invariants & Principles (Must Be Respected in All Work)

1. **AI Proposes, People Decide:** No AI model or statistical algorithm ever alters a governed segment directly. Every algorithmic output is a *proposal* requiring approval from a designated human commercial owner.
2. **0 Unapproved Write-backs:** CRM records are updated *only* upon human approval. The audit log maintains an invariant of **0 unapproved write-backs**.
3. **Grounded Evidence on Every Proposal:** Explanations cite verified driver metrics, confidence rating (High/Medium/Low), data age (in days), and source signal provenance.
4. **Segment Age Visibility:** Customer segment age is prominently shown everywhere a segment appears (e.g. `164 days`).
5. **Global Standard, Local Autonomy:** Global leadership defines standard dimensions and allowed values; local market leads configure local signal feeds, sensitivity thresholds, refresh cadences, and approval rights.
6. **Stability Policy Guardrails:** Conflicting signals, active freeze windows, or high-frequency updates trigger a governed **HOLD for Review** state rather than auto-proposing.
7. **Controlled Learning:** Rejections and field outcomes feed recalibration recommendations reviewed by human model owners. **Zero autonomous retraining**.
8. **No Promotional Language:** All AI explanations are strictly objective, factual, and grounded in clinical/behavioral drivers.
9. **Medical Is Firewalled:** Commercial segmentation only. Medical Science Liaisons (MSL) and Medical KOLs are strictly excluded.
10. **Coexistence with CRM:** Continuum integrates with and feeds downstream systems (Veeva CRM, Salesforce Life Sciences Cloud, Next Best Action engines, Call Planning); it replaces none of them.
11. **Model-Agnostic AI:** Zero vendor SDK dependencies. Operates seamlessly offline via local mock cache (`data/ai_cache.json`) or connects to any LLM via a standard REST proxy.

---

## 3. Market Data Archetypes & Brand Portfolio

### 3.1 Three Distinct Market Realities
| Market | Maturity Profile | Data Reality | Segmentation Method | Universe Size |
|---|---|---|---|---|
| **MKT_A** | **Data-rich** | Prescriber-level Rx, claims, digital tracking, KOL influence | K-means clustering $\rightarrow$ rules overlay | 8,000 HCPs / 900 HCOs |
| **MKT_B** | **Signal-enriched** | Brick-level sales, rich CRM activity, rep field notes, consented digital | Deciling + behavioural clustering | 4,000 HCPs / 400 HCOs |
| **MKT_C** | **Survey-led / Manual** | **No HCP-level sales**; PMR survey, CRM notes, rep assessments | Global rules template (potential grid) | 1,500 HCPs / 150 HCOs |

> **Critical Rule on Market C:** Market C has **no prescriber-level sales data**. Any chart or screen requiring sales automatically displays:  
> *"Not available in this market — using proxy: rep assessment + PMR"*. Continuum **never fabricates data**.

### 3.2 Brand Portfolio (All Fictitious Synthetics)
- **Aurelix** (*Immunology — Plaque Psoriasis*): **Hero launch brand** demonstrating the living loop (rep notes + digital drift $\rightarrow$ proposal $\rightarrow$ approval $\rightarrow$ CRM publish).
- **Zentrova** (*Oncology — NSCLC & Breast Cancer*): Demonstrates account-led drift (hospital formulary win $\rightarrow$ HCP adoption propagation).
- **Cardivance** (*Cardiometabolic — Heart Failure*): Demonstrates stability policy (*"not every signal triggers a change"*).
- **Neurelle** (*Neuroscience — Migraine & MS*): Demonstrates channel affinity and cross-segmentation.
- **Brevanta** (*Respiratory — Asthma & COPD*): Demonstrates urban vs. rural demographic fairness checks.

---

## 4. Persona Navigation & Rights Matrix

| ID | Persona | Landing Screen | Visible Navigation | Authority / Rights |
|---|---|---|---|---|
| **P1** | **Global Segmentation Lead** | S03 Global Standards | All 5 groups | Defines standards, approves Studio templates, activates library versions |
| **P2** | **Market Back Office** | S10 Review Queue | Segments, Changes, Standards (own market) | Runs studio within market rights, approves/rejects HCP proposals, publishes to CRM |
| **P3** | **KAM / Account Lead** | S10 Review Queue (Accounts) | Changes (S10, S11), Segments (S08 Accounts) | Approves/rejects Account tier, archetype, and access proposals |
| **P4** | **Field Rep** | S10 as *"My Customers"* | Changes (S10 My Customers only) + D01 | Validates adoption stage & digital behavior; rejects with reason codes |
| **P5** | **Local Agency** | S05 Data Intake | S05 Data Intake only | Ingests vendor spreadsheets, reviews AI column/value mapping |
| **P6** | **Executive / Compliance** | S01 Executive Cockpit | Overview, Controls, S08 (read-only) | Full global read-only audit & analytics access |

---

## 5. System Architecture & Complete Screen Map

```
CONTINUUM (v2)
├── OVERVIEW
│   ├── S01 Executive Cockpit     # Global health index, stale segments, pipeline velocity
│   └── S02 Value Calculator      # Commercial ROI modeling, unlocked capacity ($1.8M)
├── STANDARDS & DATA
│   ├── S03 Global Standards      # Dimensions, approval rights matrix, thresholds, stability policy
│   ├── S04 Market Data           # Readiness heatmap, data quality, signal freshness, feature store
│   └── S05 Data Intake           # Excel vendor intake, AI column/value mapping (AI-1)
├── SEGMENTS
│   ├── S06 Segmentation Studio   # 4-step wizard: Filter -> Build (K-means/Rules) -> Review -> Map
│   ├── S07 Segment Library       # Version lifecycle (Draft -> Approved -> Active -> Retired), bulk refresh
│   └── S08 Segment Insights      # Profiles, Opportunity gap, Migration, Accounts, Cross-market, Targeting
├── CHANGES
│   ├── S09 Change Monitor        # 5-stage living architecture pipeline, Signal Feed, Drift Flags
│   ├── S10 Review Queue          # Human approval gate with AI explanation cards (AI-3) -> opens D01
│   └── S11 Publish to CRM        # Mock CRM record view, downstream consumer impact, publish log
├── CONTROLS
│   ├── S12 Segment Health        # Segment age distribution, pipeline velocity, field trust index
│   ├── S13 Audit & Learning      # Immutable audit trail (0 unapproved write-backs), recalibration recommendations
│   └── S14 Responsible AI        # Bias checks (geographic/specialty), model explainability, drift detection
├── DETAIL DRAWER
│   └── D01 Customer 360          # Comprehensive HCP / HCO dossier, signal timeline, consent, affiliation
└── ASSISTANT
    └── S15 Ask Continuum         # Floating AI Q&A panel with deep links and tabular insights (AI-4)
```

---

## 6. The 8-Step Hero Storyline (Interactive Guided Demo)

1. **Step 1: The Problem (Fragmented Reality)** — S01 $\rightarrow$ S12 $\rightarrow$ S08. Three markets, three incompatible methodologies, average segment age is 164 days.
2. **Step 2: Why Markets Differ (Data Realities)** — S04. Market A (claims) vs Market B (brick CRM) vs Market C (no HCP sales, proxy protection).
3. **Step 3: Onboard Market C (Vendor Intake)** — S05. Ingest unstructured local agency spreadsheet; AI-1 maps columns and tiers with 92% confidence.
4. **Step 4: Segmentation Studio (Rules & K-Means)** — S06 $\rightarrow$ S07 $\rightarrow$ S08. Market A runs K-means; Market C runs Rules template. Both map into global dimensions and version in Library.
5. **Step 5: Output Insights (Opportunity & Landscape)** — S08. Connect hospital formulary access to prescriber growth opportunity in 4x4 matrix.
6. **Step 6: The Living Loop (Formulary Win & Rep Note)** — S09 $\rightarrow$ S10 $\rightarrow$ D01. Hero hospital `ACC-B-001` wins formulary; rep notes on hero prescriber `HCP-B-0001` (Dr. Hanna Vogel) trigger drift $\rightarrow$ AI-3 explanation card $\rightarrow$ human approval (B $\rightarrow$ A).
7. **Step 7: Publishing to CRM (Write-back & Audience Shift)** — S11 $\rightarrow$ S08. Writes approved updates to CRM. Segment age resets to 0d; target audiences and call plans shift. 0 unapproved write-backs.
8. **Step 8: Govern & Prove Value (Health, Audit, Bias, ROI)** — S12 $\rightarrow$ S13 $\rightarrow$ S14 $\rightarrow$ S02 $\rightarrow$ S01. Immutable audit trail, recalibration queue, demographic fairness, and $1.8M commercial value proof.

---

## 7. Current Technical Implementation

- **Frontend:** React 18, TypeScript 5.5, Vite 5, Tailwind CSS, Recharts, D3-Sankey, Lucide Icons, SheetJS (`xlsx`).
- **State Management:** Zustand store in `src/store/useAppStore.ts` with local session persistence, approval/publish event pipeline, and demo reset.
- **Data Layer:** `src/services/dataService.ts` statically loads all table schemas from `/data/*.json` (23 tables, sample rows + universe aggregates).
- **Governance Layer:** `src/services/governanceService.ts` enforces approval rights, signal thresholds, and stability policy hold reasons.
- **AI Layer:** `src/services/aiService.ts` and `src/llm/` provides model-agnostic execution for 5 tasks (AI-1 to AI-5), falling back gracefully to `data/ai_cache.json`.
- **Quality Verification:** 64 automated tests passing (`npm run test:all`):
  - `test:governance` (12 tests)
  - `test:ai` (13 tests)
  - `test:loop` (21 tests)
  - `test:persona` (6 tests)
  - `data:validate` (12 rules)
- **Deployment & Launch:** `Dockerfile`, `docker-compose.yml`, `nginx.conf`, Windows `start-demo.bat`, macOS `start-demo.sh`.

---

## 8. High-Value Research Topics for Claude

When collaborating with Claude, here are high-impact research work packages:

1. **Enterprise CRM Write-Back Integration Patterns:**
   - Research best-practice architectures for bidirectional synchronization between Continuum's proposal engine and real Veeva CRM / Salesforce Life Sciences Cloud APIs (Bulk API 2.0, Change Data Capture, Pub/Sub events).
2. **Clinical Signal Expansion & Drift Sensitivity Tuning:**
   - Research additional real-world life sciences signals (e.g. clinical trial investigator registrations, ICD-10 claims diagnostic spikes, congress abstract co-authorship, institutional pathway changes) and how to formulate drift thresholds for mature vs. launch brands.
3. **FDA / EMA & Compliance Guardrails for GenAI in Commercial Operations:**
   - Deep-dive into regulatory compliance constraints for generative AI in pharmaceutical commercial operations (e.g. preventing off-label claims, enforcing strict factual grounding, audit log requirements under 21 CFR Part 11).
4. **Market C Advanced Proxy Methodologies:**
   - Research privacy-preserving estimation techniques (e.g. hierarchical Bayesian estimation, synthetic control methods) for survey-led markets where prescriber-level sales data is legally prohibited (e.g. Germany/France/Japan GDPR & local regulations).
5. **Executive Value Pitch & Commercial Business Case:**
   - Expand the financial methodology in S02 Value Calculator with industry benchmarks (e.g. IQVIA, ZS Associates) on the financial cost of stale commercial segmentation and customer churn.
