# DATA_PROMPT_PACK.md — Synthetic Data for the Continuum Demo (v2)

**Purpose:** Run these prompts in sequence in Antigravity (or AI Studio, or any coding LLM) to generate the full mock dataset for Continuum. The output is the set of JSON files in `/data` that `DATA_SPEC.md` defines and the screen prompts read.

**What changed from v1:** aligned to `PROJECT_BRIEF.md` v2 and `DATA_SPEC.md`. Five-brand portfolio (Aurelix, Zentrova, Cardivance, Neurelle, Brevanta) instead of the cardiometabolic brands · JSON instead of CSV · `MKT_A` / `HCP-B-0001` style codes and IDs · hero records · the change pipeline files (events, flags, proposals, audit) · `aggregates.json` and `ai_cache.json`.

**How to use**
1. Make sure `DATA_SPEC.md` and `PROJECT_BRIEF.md` (or `AGENTS.md`) are in the repo, or attached to the session.
2. Run screen prompt **F1** first so the project and `package.json` exist. Then run this pack. The data must be in place before **F3**.
3. Paste **Prompt 0** first. It sets the shared rules for the whole session.
4. Run Prompts 1–9 in order. Each one builds on files created before it.
5. Run **Prompt 10** last to validate the full set. Do not start F3 until it passes.

> **Design choice:** each prompt extends a **seeded generator script** that lives in `/scripts`, outside the app. The script writes JSON to `/data`; the app only reads those files. This keeps the data reproducible and easy to resize, and it respects the brief's rule that the app itself never generates data.

> **If a session drifts:** start a fresh one, paste Prompt 0 again, then the next prompt. The generator and the files already written carry the state.

---

## Prompt 0 — Master context (paste once, at the start)

```
You are a synthetic data engineer for a pharma commercial analytics demo called
"Continuum" (governed, living HCP and account segmentation across markets).

DATA_SPEC.md is the single source of truth for every file, field, enum, ID,
volume and hero record. Read it fully before writing code. If anything in these
prompts conflicts with DATA_SPEC.md, the spec wins. Where the spec is silent or
inconsistent, choose the option that best supports the hero storyline and mark
it in code as // ASSUMPTION: and list it in your reply.

Global rules for every prompt in this session:
- All data is fictitious. No real people, institutions, products or brands.
- Write a deterministic TypeScript generator: /scripts/generate-data.ts as the
  entry point, one module per file group under /scripts/generators/, seeded
  PRNG (seed = 42). Run with Node (tsx). Add npm scripts "data:generate" and
  "data:validate". This is build-time tooling only: nothing under /src may
  generate or embed data.
- Output: JSON files in /data, named exactly as in DATA_SPEC.md. Each file is a
  UTF-8 JSON array of flat objects, except aggregates.json, ai_cache.json and
  stability_policy.json, which are objects.
- Conventions (Section 1): snake_case fields; dates YYYY-MM-DD; timestamps
  YYYY-MM-DDTHH:mm:ssZ; money as USD numbers; percentages as decimals 0–1;
  null means "not available in this market" and is never replaced by 0; enums
  exactly as listed, case-sensitive.
- Codes and IDs (Sections 1.1 and 1.2): markets MKT_A, MKT_B, MKT_C; brands
  AUR, ZEN, CRD, NEU, BRV; HCP-A-0001, ACC-B-001, TER-C-01, BRK-B-014,
  USR-001, EVT-000001, DRF-000001, PRP-000001, AUD-000001, PUB-000001,
  NOTE-000001, VER-0001.
- Demo "today" is 2026-10-15. No date after it, except freeze windows and
  scheduled refreshes.
- Volumes (Section 2): row files hold a sample of 600 / 400 / 250 HCPs and
  120 / 80 / 40 accounts for MKT_A / MKT_B / MKT_C. Full-universe figures
  (8,000 / 4,000 / 1,500 HCPs) live only in aggregates.json.
- Market data realities: MKT_A has HCP-level Rx; MKT_B has brick-level sales
  only; MKT_C has no HCP-level or brick-level sales, only quarterly account
  sell-in. Brands NEU and BRV do not exist in MKT_C.
- Hero records (Section 3) must exist exactly as specified and use the lowest
  IDs in their range. Define them once in /scripts/heroes.ts and have every
  generator import from it, so they stay consistent across files.
- Distributions must look real: Pareto on volume, noise on time series, no
  perfectly uniform splits.
- Re-running the generator must reproduce identical files.
- After each prompt: run the generator, then print row counts per file, three
  sample rows per new file, and the hero rows the prompt touched.
```

---

## Prompt 1 — Reference and users

```
Generate the reference files per DATA_SPEC Sections 3.1, 4.1, 4.2 and 4.3:
1. markets.json — 3 rows with every field in 4.1, including current_tool,
   studio_method, refresh_cycles_per_year (4 / 1 / 1), manual_hours_per_refresh
   (120 / 260 / 340), vendor_dependent, on_global_standard (false for all),
   brands (A and B: all five; C: AUR, ZEN, CRD) and universe sizes.
2. brands.json — 5 rows with therapy area, lifecycle, launch_date, indications
   (codes from Section 1.1), markets and key_specialties from 4.2.
3. personas.json — 6 rows, P1–P6, with landing_screen, visible_screens,
   label_overrides and can_approve_dimensions taken from PROJECT_BRIEF
   Section 5.1 and DATA_SPEC 4.5.
4. users.json — ASSUMPTION: the spec lists users in 3.1 but names no file for
   them. Create users.json: user_id, name, persona_id, market_code (or "ALL"),
   territory_id (nullable), agency_name (nullable). Include the nine hero users
   USR-001 … USR-009 exactly as in 3.1, then add one field rep (P4) per
   territory (12 / 8 / 5; USR-006 is the rep for TER-B-03) and two or three
   KAMs (P3) per market (USR-005 is a KAM in MKT_B).
```

## Prompt 2 — Standards and governance

```
Generate the standards files per DATA_SPEC Sections 4.4–4.8:
1. dimensions.json — the 14 dimensions in 4.4 with exact allowed_values, layer,
   refreshable_between_cycles, global_fixed, market_configurable, version
   "v3.2" and effective_from.
2. approval_rights.json — one row per market × dimension using the defaults in
   4.5, plus the MKT_C override (POTENTIAL approved by P4 Rep with P2
   co-approval). Fill ai_role, never and co_approver_role.
3. thresholds.json — per market and dimension. Must include the three examples
   in 4.6 exactly; add sensible rows for the other refreshable dimensions using
   signals that exist in that market (no TRx-based thresholds outside MKT_A).
4. stability_policy.json — object keyed by market, same shape for all three.
   Freeze windows: MKT_A 2026-10-01 → 2026-10-31 (Q4 incentive period), MKT_B
   2026-12-01 → 2026-12-31 (planning), MKT_C 2027-01-01 → 2027-01-20 (territory
   alignment).
5. vocabulary_map.json — must include MKT_A cluster_0 … cluster_4 → SEGMENT and
   BEHAVIOURAL values; MKT_B legacy tiers T1–T4 → SEGMENT A–D; MKT_C vendor
   Gold / Silver / Bronze → A / B / C and High / Med / Low → 4 / 3 / 2, with
   Low → 1 for the lowest volume-proxy decile. Mix of Accepted and Pending.
```

## Prompt 3 — Customer master

```
Generate the master files per DATA_SPEC Sections 5.1–5.4:
1. hcps.json — 1,250 rows (600 / 400 / 250). Type mix Specialist 55% / GP 35% /
   NP/PA 10% (no NP/PA in MKT_C). Urbanicity A 55/30/15, B 60/25/15, C 70/15/15.
   Specialties drawn from the key specialties of the brands available in that
   market, plus GP. brick_id only in MKT_B (BRK-B-001 … 060). kol_flag ~5%.
   rep_user_id from users.json by territory.
2. accounts.json — 240 rows (120 / 80 / 40) with fictitious names, archetype,
   hco_type, procurement_model, treatment_capability, decision_model and
   annual_patient_volume_ta by brand. Pareto: top 20% of accounts hold ~65% of
   patient volume. kam_user_id from users.json.
3. affiliations.json — ~1,830 rows. Every HCP has exactly one Primary (weight
   0.6–1.0) and 0–2 Secondary; weights per HCP sum to 1. affiliated_hcp_count
   on accounts must match.
4. consent.json — one row per HCP × channel. Email consent Granted: A 72%,
   B 64%, C 18%.
Hero records, exactly per Section 3:
- HCP-B-0001 Dr. Hanna Vogel, Dermatology, Specialist, primary account
  ACC-B-001, TER-B-03, BRK-B-014, rep USR-006.
- ACC-B-001 St. Aldric University Hospital, IDN, MKT_B, region "North", Urban,
  KAM USR-005.
- HCP-B-0002 … HCP-B-0006: oncology specialists affiliated to ACC-B-001.
- HCP-A-0100 … HCP-A-0140: rural GPs (Brevanta bias case).
- Reserve HCP-B-0007, HCP-B-0010, HCP-B-0020, HCP-A-0001, HCP-A-0002,
  HCP-A-0003 and HCP-C-0001 for the supporting cases in 3.4, with specialties
  that fit their brand.
```

## Prompt 4 — Signals

```
Generate the signal files per DATA_SPEC Sections 5.5–5.12:
1. sales.json — granularity differs by market on purpose: MKT_A HCP × brand ×
   month with trx, nrx, nbrx; MKT_B brick × brand × month, no Rx fields;
   MKT_C account sell-in × brand × quarter (2025-Q4 … 2026-Q3), no Rx fields,
   no market_share. ASSUMPTION: the spec says 12 monthly periods but lists
   2025-11 … 2026-09 (11 months); use 2025-10 … 2026-09. Shapes: AUR rising
   (+6–10% per month in MKT_A), ZEN growing, CRD flat, NEU growing, BRV flat to
   slightly declining. Top decile of MKT_A HCPs ≈ 45% of volume.
2. crm_activity.json — ~15,000 rows over the last 12 months (≈7,000 / 5,500 /
   2,500) with channel, outcome, samples_given, call_plan_flag.
3. digital_engagement.json — monthly, only for HCPs whose consent is not
   Withdrawn: all of MKT_A, consented MKT_B, ~60 HCPs in MKT_C.
4. pmr_responses.json — waves 2025-W2, 2026-W1, 2026-W2. Coverage A 35%,
   B 30%, C 55% of sample HCPs.
5. formulary_status.json — one current row per account × brand, with
   previous_status and source.
6. kol_influence.json — MKT_A full for kol_flag HCPs; MKT_B half of them;
   MKT_C null scores for all except 8 named local experts.
7. rep_notes.json — ~300 notes, 40 with ai_extracted true and
   extracted_signals filled.
8. feature_store.json — ~25 features with availability and data_age_days per
   market, including trx_qoq_change, brick_sales_qoq_change, portal_visits_3m,
   call_acceptance_rate, pmr_attitudinal, formulary_status,
   kol_influence_score, rep_adoption_assessment.
Hero signals, exactly per Section 3:
- BRK-B-014 Aurelix sales +12% QoQ in the latest quarter.
- HCP-B-0001 portal visits 3, 3, 3, 4, 5, 6 for 2026-04 … 2026-09; PMR wave
  2026-W2 (Sep 2026) attitudinal segment "Early adopter", earlier waves
  "Late majority".
- NOTE-000001, 2026-10-10, by USR-006, with the exact text in 3.3 and the three
  extracted signals listed there.
- HCP-B-0007: Aurelix sales up, plus a note "Trial driven by samples; unlikely
  to continue".
- ACC-B-001 Zentrova status Under review → Listed, effective 2026-10-08,
  source Tender.
- HCP-B-0006: declining call acceptance in crm_activity (more Declined in the
  last three months).
- HCP-B-0010: small Cardivance movement that stays below the MKT_B threshold.
- HCP-B-0020: Neurelle, high digital engagement, few completed calls.
```

## Prompt 5 — Segmentation

```
Generate the segmentation files per DATA_SPEC Section 6:
1. segment_assignments.json — current CRM values, one row per customer × brand
   × dimension, HCP and HCO. Segment age (2026-10-15 − set_date): median
   A 70 days, B 210, C 330; share older than 180 days A 12%, B 58%, C 81%.
   Aurelix HCP segment mix A–E: MKT_A 8/17/30/25/20, MKT_B 12/22/28/20/18,
   MKT_C 20/30/25/15/10. gap_filled true for 34% of MKT_C POTENTIAL values,
   9% in MKT_B, 0% in MKT_A. In MKT_A, keep rural HCPs clearly
   under-represented in Brevanta Segment A (representation index below 0.8),
   using HCP-A-0100 … 0140.
2. segment_history.json — past values per customer for the D01 timeline, with
   change_reason and approver. Include 3 historic overrides in MKT_B with no
   approver.
3. segment_library.json — seed VER-0001 … VER-0005 exactly as in 6.3, plus
   about 8 more versions across the other brands and markets.
4. studio_outputs.json — per version: clusters with size, centroid,
   feature_importance, box_stats, suggested_name, suggested_global_value and
   before_after_counts for the Sankey. VER-0001 is K-means with k = 5 and
   clearly separable clusters; importance led by trx_qoq_change,
   portal_visits_3m, pmr_attitudinal. HCP-A-0003 sits in cluster_2, mapped to
   "Engaged / Segment A". VER-0005 is the MKT_C rules template output.
Hero, exactly per Section 3.3: HCP-B-0001 Aurelix (Plaque psoriasis) current
values Segment B, Potential 3, Behavioural Traditionalist, Attitudinal Late
majority, Digital Evolving, Adoption Consideration; set_date 2026-05-04
(segment age 164 days). HCP-C-0001: Adoption Consideration, gap-filled
potential.
```

## Prompt 6 — Change pipeline

```
Generate the change files per DATA_SPEC Sections 7.1–7.3:
1. change_events.json — ~750 rows (≈380 / 260 / 110). About 40% have
   led_to_drift_flag true. Signal types only where the market has the source
   (no "Rx trend" outside MKT_A; no brick sales trend in MKT_C).
2. drift_flags.json — ~220 rows (≈110 / 75 / 35), each with
   supporting_event_ids, independent_signal_count, threshold_ref and
   model_version.
3. proposals.json — ~145 rows (≈70 / 50 / 25). Status mix: Proposed 45%,
   Held 15%, Approved 15%, Rejected 10%, Written back 15%. Every proposal has
   at least one driver, flag_ids, an approver_role taken from
   approval_rights.json, an approver_user_id and an explanation_key. Held
   proposals always have hold_reason and policy_rule_ref. Rejected ones carry
   one of the five reasons in PROJECT_BRIEF Section 11.
Hero records, exactly per Section 3:
- HCP-B-0001: events EVT-000001 (sales), EVT-000002 (digital), EVT-000003
  (PMR), EVT-000004 (rep note, detected_by GenAI); flags DRF-000001 … 000005;
  proposals PRP-000001 … 000005, status Proposed, confidence High, for
  Segment B → A, Behavioural Traditionalist → Engaged, Attitudinal Late
  majority → Early adopter, Digital Evolving → Savvy, Adoption Consideration →
  Expansion. Potential stays 3, so it has no proposal. Approvers as in 3.3.
- ACC-B-001: a Formulary change event on 2026-10-08, and two account proposals
  (ACCESS_STATUS Under review → Listed; ACC_TIER Tier 2 → Tier 1), approver
  USR-005.
- Propagation from that event: ASSUMPTION — exactly five Zentrova proposals,
  one SEGMENT proposal each for HCP-B-0002 … 0006, origin "Propagation",
  origin_ref the formulary event, with the one-level potential rise recorded as
  a driver. Confidence High for 0002–0004, Medium for 0005; HCP-B-0006 is Held
  (Conflicting signals: declining call acceptance).
- HCP-B-0007: Aurelix proposal Held, Conflicting signals.
- HCP-A-0001: Aurelix proposal Held, Freeze window (2026-10-01 → 2026-10-31).
- HCP-A-0002: Aurelix proposal Rejected, reason "Temporary behaviour".
- HCP-C-0001: ADOPTION Consideration → Trial, confidence Medium, driven by a
  rep observation, approver P4.
- HCP-B-0010: a Cardivance event with led_to_drift_flag false and no flag or
  proposal.
Put the hero rows first in each file.
```

## Prompt 7 — Records and learning

```
Generate the record files per DATA_SPEC Sections 7.4–7.7:
1. audit_log.json — ~400 entries over the last 120 days, consistent with the
   proposals, library versions, thresholds and mappings already generated.
   Invariant: every "Written back" entry has an earlier "Proposal approved"
   entry for the same entity with a named approver. Unapproved write-backs = 0.
2. publish_log.json — publishes per market and Active version, with
   records_written, target_systems and status; totals agree with the Written
   back proposals.
3. downstream_impact.json — per market, brand and consumer (Targeting, Call
   planning, Next-best-action, Journeys, Segment-health dashboard) with before
   and after. Include the examples in 7.6: call planning 1,840 → 2,060, target
   list 610 → 642, NBA records refreshed 0 → 186, journey re-entries 74.
4. recalibration.json — 3 recommendations, including MKT_A ADOPTION (38% of
   rejections "Temporary behaviour" → raise lookback from 90 to 120 days),
   status Recommended, model owner USR-001.
```

## Prompt 8 — Vendor file and AI cache

```
Generate the intake and AI files per DATA_SPEC Sections 3.5 and 8:
1. vendor_file_mkt_c.json and an identical vendor_file_mkt_c.xlsx (write it
   with SheetJS) — 260 rows from "Northbay Field Research", Aurelix and
   Zentrova, columns Ref_No, Dr_Name, Spec, Clinic, City, Pot_Class, Segmen,
   Adopt, Last_Visit, Remarks. Deliberately messy: Potential High/Med/Low,
   Segment Gold/Silver/Bronze, Adoption Aware/Trying/Using/Loyal; 18 rows with
   no customer ID, 12 with typos in name or specialty, 9 duplicates, 11 HCPs
   not in the customer master. Build the rows so the app's matching logic
   gives exactly: match rate 92.3% (240 of 260), conformance 88%, data-quality
   score 74 before fixes and 91 after, using the formula in Section 10.1.
2. ai_cache.json — object keyed by AI-1 … AI-5:
   - AI-1: full mapping for the vendor file (key "vendor_mkt_c_v1").
   - AI-2: every cluster of VER-0001 and VER-0005.
   - AI-3: every hero proposal plus at least 30 others; keys equal the
     proposals' explanation_key values, and every proposal's key must resolve.
   - AI-5: all 40 extracted rep notes, including NOTE-000001.
   - AI-4: answers (short text, optional table, link to a screen) for these
     twelve questions:
       1. Which market has the oldest segments?            → S12
       2. Which segments are older than 9 months?          → S12
       3. Why is Dr. Hanna Vogel proposed to move to Segment A? → S10
       4. Which proposals are on hold, and why?            → S10
       5. What changed at St. Aldric University Hospital?  → S09
       6. How many unapproved write-backs are there?       → S13
       7. Which markets are on the global standard?        → S12
       8. Is Market C's data ready?                        → S04
       9. Where is the biggest opportunity gap for Aurelix? → S08
      10. What are the top rejection reasons?              → S13
      11. Is any group under-represented in Segment A?     → S14
      12. What is living segmentation worth?               → S02
   Text rules: factual, at most 60 words per explanation, cites drivers and
   data age, numbers agree with the generated data, no promotional wording, no
   clinical claims.
```

## Prompt 9 — Aggregates

```
Generate aggregates.json per DATA_SPEC Sections 9 and 10. Object with as_of
"2026-10-15", a "markets" block keyed MKT_A, MKT_B, MKT_C and ALL, and
"value_levers".
- Per market: hcp_universe, account_universe, segment_age (median_days,
  pct_stale_180, histogram), segment_mix per brand, data_quality, pipeline_30d,
  time_to_update_days, override_rate, acceptance_rate, approval_cycle_days,
  standardisation.
- Use the spec's figures exactly: MKT_A as written in Section 9; MKT_B events
  430, flags 108, proposals 64, held 15, written back 33, median age 210;
  MKT_C events 190, flags 44, proposals 27, held 8, written back 12, median
  age 330, conformance 0.42.
- ALL: events 1,240, flags 312, explanations 312, proposals 186, held 41,
  approved 97, written back 97. Every market figure must sum to ALL.
- Full-universe distributions (segment mix, age, urbanicity) keep the same
  shape as the row samples, so drill-downs agree with the KPIs.
- value_levers: the four levers in Section 10.2 with their default inputs.
```

## Prompt 10 — Validation (run last)

```
Write /scripts/validate-data.ts and run it. It checks every file in /data and
prints a PASS/FAIL report with evidence for all 12 rules in DATA_SPEC
Section 11:
 1. Every foreign key resolves (hcp_id, hco_id, market_code, brand_code,
    version_id, flag_id, event_id, user_id).
 2. Every enum value is in the spec; every segment value is in
    dimensions.json allowed_values.
 3. MKT_C has no sales rows with granularity HCP or BRICK and no non-null trx.
 4. NEU and BRV have no rows in MKT_C, in any file.
 5. No date after 2026-10-15, except freeze windows and scheduled refreshes.
 6. Every hero record in Section 3 exists with the exact values.
 7. aggregates.json market figures sum to ALL.
 8. Audit invariant: 0 unapproved write-backs.
 9. Every proposal has at least one driver and an explanation_key present in
    ai_cache.json.
10. Every Held proposal has hold_reason and policy_rule_ref.
11. Distributions are realistic: Pareto on volume, no uniform splits, noise on
    time series; segment age and mix match Section 6.1.
12. Names are fictitious.
Also check: primary keys unique; affiliation weights sum to 1 per HCP; vendor
file gives match rate 92.3% and conformance 88%; HCP-B-0001 segment age is 164
days; the generator is deterministic (two runs give identical files).
Fix every FAIL in the generator, not by hand-editing JSON, and re-run until all
pass. Then print the full file list with row counts, every ASSUMPTION made, and
a short summary of the demo stories the data supports.
```

---

## Output files at a glance

| # | Files | Feeds |
|---|-------|-------|
| 1 | markets, brands, personas, users | Filters, persona switcher, all screens |
| 2 | dimensions, approval_rights, thresholds, stability_policy, vocabulary_map | S03 Global Standards, governance rules, S08 Cross-market |
| 3 | hcps, accounts, affiliations, consent | D01 Customer 360, S08 Accounts, S11 audience counts |
| 4 | sales, crm_activity, digital_engagement, pmr_responses, formulary_status, kol_influence, rep_notes, feature_store | S04 Market Data, S09 Signal Feed, D01 signals |
| 5 | segment_assignments, segment_history, segment_library, studio_outputs | S06 Studio, S07 Library, S08 Insights, S12 Health |
| 6 | change_events, drift_flags, proposals | S09 Change Monitor, S10 Review Queue |
| 7 | audit_log, publish_log, downstream_impact, recalibration | S11 Publish, S13 Audit & Learning |
| 8 | vendor_file_mkt_c (.json and .xlsx), ai_cache | S05 Data Intake, all AI moments, S15 Ask Continuum |
| 9 | aggregates | S01 Cockpit, S02 Value Calculator, every full-universe KPI |

## Demo stories built into the data

1. **Three markets, three processes:** different tools, cadences and segment mixes (Market C's agency file inflates the top segments), so segments can't be compared until they are mapped to the global standard.
2. **Onboarding Market C:** a messy vendor Excel maps to the standard with a 92.3% match rate, and the data-quality score moves from 74 to 91.
3. **Living loop:** four independent signals move Dr. Hanna Vogel (HCP-B-0001) from Segment B to A on Aurelix, 164 days after her segment was last set.
4. **Account propagation:** a Zentrova formulary win at St. Aldric University Hospital (ACC-B-001) raises proposals for five affiliated oncologists; one is held for conflicting signals.
5. **Stability policy at work:** proposals held for conflicting signals (HCP-B-0007) and a freeze window (HCP-A-0001); a past rejection for temporary behaviour (HCP-A-0002).
6. **Not every signal changes the segment:** a Cardivance movement below threshold creates a change event and no drift flag (HCP-B-0010).
7. **Works in low-data markets:** Market C runs on rep observation and PMR, with gap-filled potential and lower confidence shown openly (HCP-C-0001).
8. **Fair and under control:** rural GPs under-represented in Brevanta Segment A, and zero unapproved write-backs in the audit log.
9. **Faster cycle:** time to update drops from about 92 days to 9 in Market A.
