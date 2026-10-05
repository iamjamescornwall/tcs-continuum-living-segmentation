# Continuum (v2) — Executive Presenter & Demo Runbook

> **Target Presentation Time:** 20–25 minutes  
> **Audience:** Chief Commercial Officers, Heads of Commercial Excellence, Heads of Analytics, IT & CRM Leads  
> **Key Message:** *"Analyst workbenches build segments. Continuum runs segmentation as a governed global process — every market, every data reality, from studio to CRM."*

---

## Pre-Flight Checklist

1. Open your browser to **[http://localhost:5173/](http://localhost:5173/)**.
2. Click the user profile / persona dropdown in the top right $\rightarrow$ click **"Demo Reset"** to guarantee clean initial state:
   - Hero proposal `PRP-000001` (Dr. Hanna Vogel) in `Proposed` state.
   - CRM record segment at `B` with `164 days` age.
   - Unapproved write-backs = `0`.
3. Locate the **Guided Demo** toggle in the top bar (gold badge with play icon).  
   *Tip: Clicking "Next" on the Guided Demo bar automatically sets the correct Persona, Market, Brand, and Screen tab for each step.*

---

## 8-Step Storyline Cue Cards

### Step 1: The Problem — Fragmented Reality (3 mins)
- **Goal:** Show that global commercial operations cannot compare customer segments across countries.
- **Screens:** `S01 Executive Cockpit` $\rightarrow$ `S12 Segment Health (Standardisation)` $\rightarrow$ `S08 Insights (Cross-market)`
- **Presenter Script:**
  > *"Every global pharma company faces the same reality: Market A built a machine-learning model in Python; Market B uses an annual consulting agency deciling exercise; Market C pays a local research vendor for an Excel spreadsheet. When global leadership asks 'Who are our Tier 1 launch prescribers across Europe and North America?', nobody has a comparable answer. Let's look at S01: we see 3 distinct markets, but our Global Standardisation Score is only 42%. Look at S08 Cross-market: segment definitions don't align, and segments are decaying in the field."*
- **Aha! Moment:** Point out the segment age chip on S01: the average segment has not been refreshed in **164 days**.

---

### Step 2: Why Markets Differ — Data Realities (2 mins)
- **Goal:** Explain *why* markets cannot simply copy-paste the same algorithm.
- **Screens:** `S04 Market Data (Readiness Heatmap & Data Quality)`
- **Presenter Script:**
  > *"Why doesn't global just force one model on everyone? Because data realities are fundamentally different. On S04 Readiness Heatmap, Market A has rich prescriber-level Rx claims and digital signals. Market B only has brick-level sales and CRM notes. Market C has strict privacy laws with zero HCP sales data. Continuum doesn't force an impossible data standard—it provides a governed translation layer that respects local data maturity."*
- **Aha! Moment:** Point out the **Market C Proxy Notice**: Continuum never invents sales figures; it explicitly flags proxy reliance.

---

### Step 3: Onboard Market C — Vendor Excel Intake (3 mins)
- **Goal:** Show how unstructured external vendor files are ingested and mapped using AI.
- **Screens:** `S05 Data Intake` (Persona switches to **P5 Local Agency**)
- **Presenter Script:**
  > *"Let's put ourselves in the shoes of an external agency in Market C. They upload an Excel file containing local survey results. Watch what happens: AI-1 analyzes the columns and values, mapping local labels like 'High Prescriber' to the global potential tier 'Tier 1' with 92% match confidence. In seconds, an incompatible agency spreadsheet is standardized into our global customer master without manual ETL engineering."*
- **Action:** Click "Inspect AI Mapping" and show the side-by-side source $\rightarrow$ target mapping table with confidence badges.

---

### Step 4: Segmentation Studio — Rules & K-Means (3 mins)
- **Goal:** Show how both algorithmic (K-means) and rule-based segmentation are governed in one studio.
- **Screens:** `S06 Segmentation Studio` $\rightarrow$ `S07 Segment Library`
- **Presenter Script:**
  > *"In S06 Segmentation Studio, Market A can run an unsupervised K-means clustering algorithm, while Market C uses our Global Potential Grid rules template. AI-2 names and describes the clusters objectively based on their centroid drivers. Once completed, both models map their outputs directly into the global dimension catalog and save as versioned assets in the S07 Segment Library. Notice the version lifecycle: Draft $\rightarrow$ Approved $\rightarrow$ Active. Only an Active version can publish to production CRM."*
- **Action:** Show the K-means scatter plot and switch to the Rules matrix to demonstrate methodology flexibility.

---

### Step 5: Output Insights — Opportunity & Landscape (3 mins)
- **Goal:** Show the strategic value of unified segmentation across HCPs and HCOs.
- **Screens:** `S08 Segment Insights (Opportunity Gaps & Accounts)`
- **Presenter Script:**
  > *"Now that our segments are standardized, what can commercial leaders actually see? In S08 Opportunity Gaps, we identify prescribers with high clinical potential but low current brand adoption—our prime growth targets. More importantly, look at the Accounts tab: Continuum links prescriber opportunity to institution access. A high-potential doctor in a hospital without formulary access is capped; when the hospital wins formulary, the doctor's opportunity unlocks."*
- **Aha! Moment:** Show the 4x4 matrix linking Account Access Status to HCP Potential.

---

### Step 6: The Living Loop — Formulary Win & Rep Note (4 mins)
- **Hero Moment:** Demonstrate the core living loop on hero brand **Aurelix** and prescriber **Dr. Hanna Vogel**.
- **Screens:** `S09 Change Monitor (Pipeline & Signal Feed)` $\rightarrow$ `S10 Review Queue` $\rightarrow$ `D01 Customer 360`
- **Presenter Script:**
  > *"This is the heart of Continuum: what happens between annual planning cycles? Let's look at S09 Change Monitor. Stage 1 watches signals: St. Jude Medical Center won formulary approval for Aurelix, and our rep logged a field note that Dr. Hanna Vogel is expanding biologic use. Stage 2 ML flags positive drift. Stage 3 GenAI generates an objective explanation card grounded strictly in clinical and behavioral drivers. Stage 4 routes a proposal to Market Back Office: promote Dr. Vogel from Segment B to Segment A. Notice: Stage 4 is highlighted in gold because AI proposes, but humans decide."*
- **Action:**
  1. Open S10 Review Queue. Locate `PRP-000001` (Dr. Hanna Vogel).
  2. Click Dr. Vogel's row to open **D01 Customer 360**. Point out the explanation card, signal history, and segment age (164 days).
  3. Click **"Approve Proposal"** in the modal.
- **Aha! Moment:** The proposal moves to `Approved`. The pipeline counters update in real time. **Zero changes have touched CRM yet.**

---

### Step 7: Publishing to CRM — Write-back & Audience Shift (3 mins)
- **Goal:** Prove governed write-back and show downstream operational alignment.
- **Screens:** `S11 Publish to CRM` $\rightarrow$ `S08 (Targeting Alignment)`
- **Presenter Script:**
  > *"In S11 Publish to CRM, the approved changes are queued. Only approved records can be written back. Watch as we click 'Publish to CRM': Dr. Vogel's live CRM record is updated, the proposed segment field clears, and her Segment Age resets from 164 days to 0 days. Below, look at the downstream impact: our multichannel marketing audience, call planning priority, and Next Best Action engine immediately reflect the updated tier. Continuum didn't replace Veeva or Salesforce—it made them living."*
- **Action:** Click **"Publish All Approved (7)"**. Verify the toast notification and inspect the mock CRM record showing `Sync Status: Synced` and `Age: 0d`.

---

### Step 8: Govern & Prove Value (4 mins)
- **Goal:** Show executive governance, auditability, demographic fairness, and ROI.
- **Screens:** `S12 Segment Health` $\rightarrow$ `S13 Audit & Learning` $\rightarrow$ `S14 Responsible AI` $\rightarrow$ `S02 Value Calculator` $\rightarrow$ `S01 Cockpit`
- **Presenter Script:**
  > *"To wrap up, how do we govern this and prove ROI to leadership? In S13 Audit Log, notice our immutable rule: 0 unapproved write-backs. Every single change has an approver, timestamp, and audit trail. In S13 Recalibration, rep rejections don't auto-retrain the model in the dark; they generate a recalibration recommendation for human review. In S14 Responsible AI, we verify urban vs. rural demographic fairness to ensure no prescriber bias. And finally, S02 Value Calculator proves the financial impact: by detecting rising prescribers 120 days faster, Continuum delivers $1.8M in unlocked commercial capacity."*
- **Closing Punchline:**
  > *"Analyst workbenches build segments. Continuum runs segmentation as a governed global process — every market, every data reality, from studio to CRM."*

---

## Frequently Asked Questions (Presenter Cheat Sheet)

### Q: "Does Continuum replace our CRM (Veeva / Salesforce)?"
> **Answer:** *"No. Continuum strictly coexists. Veeva and Salesforce are execution engines; Continuum is the governed living intelligence layer. Continuum reads signals from CRM and writes approved segment updates back via standard APIs."*

### Q: "What prevents the AI from making wild, ungrounded recommendations?"
> **Answer:** *"Three strict guardrails: (1) Explanations must cite verified feature store drivers only; (2) Stability policies automatically HOLD proposals during freeze windows or for conflicting signals; (3) Human Gate: no change ever reaches CRM without human approval."*

### Q: "What if a field rep disagrees with an algorithm update?"
> **Answer:** *"Field reps can reject proposals with a specific reason code (e.g. 'Temporary behavior' or 'Field knowledge contradicts signal'). Rejections feed the Recalibration queue in S13 for data science review rather than blindly overriding the rep."*

### Q: "Can we plug in our own enterprise LLM (Azure OpenAI, Bedrock, Claude)?"
> **Answer:** *"Yes. Continuum has zero vendor SDK locks. It runs completely offline with its pre-built validation cache, or points directly to your corporate LLM proxy by switching a single configuration toggle in Settings."*
