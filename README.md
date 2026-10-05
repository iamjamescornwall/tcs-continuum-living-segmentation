# Continuum (v2) — Governed, Living Segmentation Across Every Market

> *"Analyst workbenches build segments. Continuum runs segmentation as a governed global process — every market, every data reality, from studio to CRM."*

**Continuum** is an enterprise commercial analytics web application built for life sciences and pharmaceuticals. It unifies fragmented market segmentation workflows (in-house models, external vendor files, disparate tools) into **one governed global vocabulary**, actively detects drift between annual planning cycles, explains changes with grounded evidence, routes proposals to named commercial owners, and writes approved changes back to CRM.

---

## 1. Non-Negotiable Product Principles

Continuum enforces 11 core architectural and governance principles:

1. **AI proposes, people decide:** No AI or algorithmic model ever updates a governed segment field directly. Every change is a proposal requiring human approval.
2. **Nothing is written back unapproved:** CRM write-backs happen only after formal approval. Audit trail always maintains **0 unapproved write-backs**.
3. **Every proposal carries evidence:** Explanations cite grounded drivers, confidence level (High/Med/Low), data age, and source signals.
4. **Segment age is visible everywhere:** Prominent chips show customer segment age (e.g. `164 days`) across tables, cards, and CRM records.
5. **Global vocabulary, local control:** Global defines standard dimensions and allowed values; markets configure signal feeds, thresholds, cadence, and approval rights.
6. **Stability policy is enforced:** Freeze windows, change-frequency limits, and minimum evidence rules hold conflicting or volatile changes for review.
7. **Controlled learning:** Approvals, rejections, and field outcomes feed recalibration recommendations validated by a model owner. No autonomous retraining.
8. **No promotional language:** All AI-generated explanations are strictly factual and grounded in drivers.
9. **Medical is firewalled:** Medical/MSL personas and medical KOL segmentation are strictly out of scope.
10. **Coexistence, not replacement:** Continuum publishes to CRM and downstream commercial consumers (targeting, call planning, NBA); it replaces none of them.
11. **Model-agnostic AI layer:** Zero vendor SDK dependencies (`package.json` contains no OpenAI/Anthropic/Gemini SDKs). Fully operable offline via pre-generated cache, or connectable to any LLM proxy.

---

## 2. Market Data Realities & Archetypes

Continuum handles three distinct market data archetypes without compromising governance:

| Market | Display Name | Maturity | Data Reality | Segmentation Method | Living Signals | Universe (HCP / HCO) |
|---|---|---|---|---|---|---|
| **MKT_A** | Market A · Data-rich | Data-rich | HCP-level Rx & claims, digital engagement, KOL influence | K-means $\rightarrow$ rules overlay | Continuous re-scoring, claim triggers | 8,000 / 900 |
| **MKT_B** | Market B · Signal-enriched | Signal-enriched | Brick-level sales, rich CRM activity, consented digital | Deciling + behavioural clustering | CRM frequency, rep notes, formulary events | 4,000 / 400 |
| **MKT_C** | Market C · Survey-led | Survey-led / manual | No HCP sales; PMR survey + CRM notes + rep assessment | Global rules template (potential grid) | Rep notes, survey responses | 1,500 / 150 |

> **Market C Proxy Protection:** Market C has **no HCP-level sales**. Any chart or screen requiring sales automatically displays:  
> *"Not available in this market — using proxy: rep assessment + PMR"*. Continuum never fabricates data.

---

## 3. Brand Portfolio

- **Aurelix** (*Immunology — Plaque Psoriasis & Psoriatic Arthritis*): **Hero launch brand** demonstrating the living loop (rep notes + digital drift $\rightarrow$ proposal $\rightarrow$ approval $\rightarrow$ CRM publish).
- **Zentrova** (*Oncology — NSCLC & HER2+ Breast Cancer*): Demonstrates account-led drift (hospital formulary win $\rightarrow$ HCP adoption propagation).
- **Cardivance** (*Cardiometabolic — Heart Failure & CKD*): Mature brand demonstrating stability policies (*"not every signal triggers a segment change"*).
- **Neurelle** (*Neuroscience — Migraine & MS*): Digital-heavy brand showing channel affinity and cross-segmentation.
- **Brevanta** (*Respiratory — Severe Asthma & COPD*): Demonstrates urban vs. rural bias checks and GP/specialist demographic parity.

---

## 4. Persona Navigation & Rights Matrix

The application dynamically adjusts navigation, landing screens, and action permissions based on the active persona:

| ID | Persona | Landing Screen | Visible Nav Groups | Can Act |
|---|---|---|---|---|
| **P1** | **Global Segmentation Lead** | S03 Global Standards | All 5 groups | Edit standards, approve studio templates, activate versions, approve recalibration |
| **P2** | **Market Back Office** (Comm Ex) | S10 Review Queue | Segments, Changes, Standards & Data (own market) | Run Studio within market rights, approve/reject HCP proposals, publish to CRM |
| **P3** | **KAM / Account Lead** | S10 Review Queue (Accounts) | Changes (S10, S11), Segments (S08 Accounts) | Approve/reject account archetype, tier, access proposals |
| **P4** | **Field Rep** | S10 as *"My Customers"* | Changes (S10 My Customers only) + D01 | Validate adoption stage & digital preference; reject with reason |
| **P5** | **Local Agency** (Vendor) | S05 Data Intake | S05 Data Intake only | Upload segmentation files, view schema mapping & validation |
| **P6** | **Executive / Compliance** | S01 Executive Cockpit | Overview, Controls, S08 (read-only) | Read-only; audit review & executive reporting |

---

## 5. Application Architecture & Screens

Continuum consists of **16 interconnected surfaces** organised into 5 logical groups:

```
CONTINUUM
├── OVERVIEW
│   ├── S01 Executive Cockpit     # Global health index, stale segments, pipeline velocity
│   └── S02 Value Calculator      # ROI modeling, capacity unlocked, conversion lift
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

## 6. The 8-Step Hero Storyline

The application includes an interactive **Guided Demo** controller in the top bar with pre-configured filters, persona switching, and step guidance:

1. **Step 1: The Problem (Fragmented Reality)**  
   *Screens:* S01 $\rightarrow$ S12 (Standardisation) $\rightarrow$ S08 (Cross-market)  
   *Narrative:* Three markets, three incompatible methodologies (K-means, deciling, Excel agency). Segments cannot be compared globally.
2. **Step 2: Why Markets Differ (Data Realities)**  
   *Screens:* S04 (Readiness Heatmap & Data Quality)  
   *Narrative:* Market A has claims; Market B has brick CRM; Market C has no HCP sales.
3. **Step 3: Onboarding Market C (Vendor Intake)**  
   *Screens:* S05 Data Intake  
   *Narrative:* Upload local agency spreadsheet; AI-1 maps local columns and values to the global standard with high confidence.
4. **Step 4: Segmentation Studio (Rules & K-Means)**  
   *Screens:* S06 $\rightarrow$ S07 Segment Library $\rightarrow$ S08 Profiles  
   *Narrative:* Market C runs the Global Potential Grid template; Market A runs K-means. Both map into the global standard and publish as versioned assets.
5. **Step 5: Output Insights (Opportunity & Landscape)**  
   *Screens:* S08 (Opportunity, Accounts, Cross-segmentation)  
   *Narrative:* Discovering high-potential under-served accounts and misaligned prescriber tiers.
6. **Step 6: The Living Loop (Formulary Win & Rep Note)**  
   *Screens:* S09 Change Monitor $\rightarrow$ S10 Review Queue $\rightarrow$ D01 Customer 360  
   *Narrative:* Hero account `ACC-B-001` (St. Jude Medical Center) wins formulary for Zentrova. Rep notes on hero prescriber `HCP-B-0001` (Dr. Hanna Vogel) trigger change events $\rightarrow$ drift detection $\rightarrow$ AI-3 explanation card. Commercial owner approves promotion from Segment B $\rightarrow$ A.
7. **Step 7: Publishing to CRM (Write-back & Audience Shift)**  
   *Screens:* S11 Publish to CRM $\rightarrow$ S08 (Targeting Alignment)  
   *Narrative:* Approved changes are committed to CRM. Segment age resets to 0d; target lists and call plans update automatically. Invariant preserved: 0 unapproved write-backs.
8. **Step 8: Govern & Prove Value (Health, Audit, Bias, ROI)**  
   *Screens:* S12 $\rightarrow$ S13 $\rightarrow$ S14 $\rightarrow$ S02 Value Calculator $\rightarrow$ S01 Cockpit  
   *Narrative:* Review the immutable audit log, model recalibration recommendations, demographic fairness checks, and financial ROI ($1.8M capacity unlocked).

---

## 7. AI Layer Architecture (Model-Agnostic)

Continuum defines 5 distinct AI moments using provider-neutral prompt templates (`/prompts`):

| Task ID | Moment | Screen | System Function |
|---|---|---|---|
| **AI-1** | Vendor File Mapping | S05 | Maps unstructured source columns and category values to global standard fields |
| **AI-2** | Cluster Naming & Description | S06 | Generates objective business titles and clinical descriptions for K-means clusters |
| **AI-3** | Proposal Explanation Card | S10, D01 | Synthesizes grounded drivers, signal confidence, and future movement criteria |
| **AI-4** | Ask Continuum | S15 | Natural language commercial Q&A with deep application navigation links |
| **AI-5** | Rep-Note Signal Extraction | S09, D01 | Parses unstructured field notes into structured dimension signals and quotes |

### Provider Support
- **`MockProvider` (Default):** Instant, offline demo mode reading pre-generated outputs from `data/ai_cache.json`.
- **`OpenAICompatibleProvider`:** Supports OpenAI, Azure OpenAI, Groq, Mistral, and local Ollama/vLLM endpoints.
- **`AnthropicProvider` & `GeminiProvider`:** Direct REST adapters without proprietary SDK dependencies.
- **`server/llm-proxy`:** Lightweight Node.js proxy holding API keys securely on the server side.

---

## 8. Verification & Test Suites

The repository includes a comprehensive 5-part test suite with **64 automated checks**:

```bash
# Run all automated tests and data validation
npm run test:all
```

Individual test suites:
```bash
npm run test:governance   # 12 checks: Approval rights, thresholds, stability policy
npm run test:ai           # 13 checks: All 5 AI tasks, caching, and graceful fallback
npm run test:loop         # 21 checks: Living state loop, approval, CRM publish, age reset, reset
npm run test:persona      # 6 checks: P1-P6 permission matrix, tooltips, read-only enforcement
npm run data:validate     # 12 checks: 12 DATA_SPEC validation rules on all JSON files
```

---

## 9. Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:5173
```

### Production Build
```bash
# TypeScript type-check and Vite bundle
npm run build

# Preview production build locally
npm run preview
```

### Docker Container Deployment
```bash
# Build and run container with Nginx
docker compose up --build -d

# Open browser at http://localhost:8080
```

---

## 10. Technology Stack

- **Framework:** React 18 with TypeScript 5.5
- **Bundler:** Vite 5 with route-level dynamic imports (`React.lazy`)
- **Styling:** Tailwind CSS with enterprise color tokens (Navy 900, Slate, Teal 600, Gold 500)
- **State Management:** Zustand with local session persistence and demo reset
- **Data Visualizations:** Recharts & D3-Sankey
- **File Parsing:** SheetJS `xlsx` (vendor spreadsheet ingestion)
- **Icons:** Lucide React
- **Validation:** Zod schemas for all AI outputs and data contracts
