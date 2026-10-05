/**
 * Prompt 9: Aggregates generator
 * Produces aggregates.json
 */

import { AggregatesData } from '../../src/types';
import { writeJsonFile } from '../utils';

export function generateAggregatesData(): AggregatesData {
  const aggregates: AggregatesData = {
    as_of: '2026-10-15',
    markets: {
      MKT_A: {
        hcp_universe: 8000,
        account_universe: 900,
        segment_age: {
          median_days: 70,
          pct_stale_180: 0.12,
          histogram: [
            { range: '<30d', count: 2400 },
            { range: '30-90d', count: 3200 },
            { range: '90-180d', count: 1440 },
            { range: '>180d', count: 960 },
          ],
        },
        segment_mix: {
          AUR: { A: 0.08, B: 0.17, C: 0.30, D: 0.25, E: 0.20 },
          ZEN: { A: 0.10, B: 0.20, C: 0.35, D: 0.20, E: 0.15 },
          CRD: { A: 0.15, B: 0.25, C: 0.30, D: 0.20, E: 0.10 },
          NEU: { A: 0.12, B: 0.22, C: 0.28, D: 0.22, E: 0.16 },
          BRV: { A: 0.09, B: 0.18, C: 0.31, D: 0.24, E: 0.18 },
        },
        data_quality: {
          hcp_match_rate: 0.97,
          duplicate_rate: 0.01,
          pct_primary_affiliation: 0.94,
        },
        pipeline_30d: {
          change_events: 620,
          drift_flags: 160,
          explanations: 160,
          proposals: 95,
          held: 18,
          approved: 53,
          rejected: 12,
          written_back: 52,
        },
        time_to_update_days: {
          baseline: 92,
          current: 9,
        },
        override_rate: {
          before: 0.21,
          after: 0.08,
        },
        acceptance_rate: 0.83,
        approval_cycle_days: 2.4,
        standardisation: {
          on_global_standard: false,
          conformance: 0.71,
        },
      },
      MKT_B: {
        hcp_universe: 4000,
        account_universe: 400,
        segment_age: {
          median_days: 210,
          pct_stale_180: 0.58,
          histogram: [
            { range: '<30d', count: 480 },
            { range: '30-90d', count: 680 },
            { range: '90-180d', count: 520 },
            { range: '>180d', count: 2320 },
          ],
        },
        segment_mix: {
          AUR: { A: 0.12, B: 0.22, C: 0.28, D: 0.20, E: 0.18 },
          ZEN: { A: 0.14, B: 0.24, C: 0.32, D: 0.18, E: 0.12 },
          CRD: { A: 0.16, B: 0.26, C: 0.28, D: 0.18, E: 0.12 },
          NEU: { A: 0.11, B: 0.21, C: 0.30, D: 0.22, E: 0.16 },
          BRV: { A: 0.10, B: 0.20, C: 0.30, D: 0.22, E: 0.18 },
        },
        data_quality: {
          hcp_match_rate: 0.94,
          duplicate_rate: 0.02,
          pct_primary_affiliation: 0.91,
        },
        pipeline_30d: {
          change_events: 430,
          drift_flags: 108,
          explanations: 108,
          proposals: 64,
          held: 15,
          approved: 32,
          rejected: 8,
          written_back: 33,
        },
        time_to_update_days: {
          baseline: 180,
          current: 14,
        },
        override_rate: {
          before: 0.25,
          after: 0.10,
        },
        acceptance_rate: 0.80,
        approval_cycle_days: 3.1,
        standardisation: {
          on_global_standard: false,
          conformance: 0.65,
        },
      },
      MKT_C: {
        hcp_universe: 1500,
        account_universe: 150,
        segment_age: {
          median_days: 330,
          pct_stale_180: 0.81,
          histogram: [
            { range: '<30d', count: 60 },
            { range: '30-90d', count: 90 },
            { range: '90-180d', count: 135 },
            { range: '>180d', count: 1215 },
          ],
        },
        segment_mix: {
          AUR: { A: 0.20, B: 0.30, C: 0.25, D: 0.15, E: 0.10 },
          ZEN: { A: 0.22, B: 0.32, C: 0.24, D: 0.14, E: 0.08 },
          CRD: { A: 0.25, B: 0.35, C: 0.22, D: 0.12, E: 0.06 },
          NEU: { A: 0.0, B: 0.0, C: 0.0, D: 0.0, E: 0.0 },
          BRV: { A: 0.0, B: 0.0, C: 0.0, D: 0.0, E: 0.0 },
        },
        data_quality: {
          hcp_match_rate: 0.88,
          duplicate_rate: 0.04,
          pct_primary_affiliation: 0.84,
        },
        pipeline_30d: {
          change_events: 190,
          drift_flags: 44,
          explanations: 44,
          proposals: 27,
          held: 8,
          approved: 12,
          rejected: 4,
          written_back: 12,
        },
        time_to_update_days: {
          baseline: 365,
          current: 22,
        },
        override_rate: {
          before: 0.32,
          after: 0.14,
        },
        acceptance_rate: 0.75,
        approval_cycle_days: 4.8,
        standardisation: {
          on_global_standard: false,
          conformance: 0.42,
        },
      },
      ALL: {
        hcp_universe: 13500, // 8000 + 4000 + 1500
        account_universe: 1450, // 900 + 400 + 150
        segment_age: {
          median_days: 140,
          pct_stale_180: 0.33,
          histogram: [
            { range: '<30d', count: 2940 },
            { range: '30-90d', count: 3970 },
            { range: '90-180d', count: 2095 },
            { range: '>180d', count: 4495 },
          ],
        },
        segment_mix: {
          AUR: { A: 0.10, B: 0.20, C: 0.29, D: 0.23, E: 0.18 },
          ZEN: { A: 0.12, B: 0.22, C: 0.33, D: 0.19, E: 0.14 },
          CRD: { A: 0.16, B: 0.26, C: 0.29, D: 0.19, E: 0.10 },
          NEU: { A: 0.12, B: 0.22, C: 0.28, D: 0.22, E: 0.16 },
          BRV: { A: 0.09, B: 0.18, C: 0.31, D: 0.24, E: 0.18 },
        },
        data_quality: {
          hcp_match_rate: 0.95,
          duplicate_rate: 0.016,
          pct_primary_affiliation: 0.92,
        },
        pipeline_30d: {
          change_events: 1240, // 620 + 430 + 190
          drift_flags: 312, // 160 + 108 + 44
          explanations: 312, // 160 + 108 + 44
          proposals: 186, // 95 + 64 + 27
          held: 41, // 18 + 15 + 8
          approved: 97, // 53 + 32 + 12
          rejected: 24, // 12 + 8 + 4
          written_back: 97, // 52 + 33 + 12
        },
        time_to_update_days: {
          baseline: 148,
          current: 12,
        },
        override_rate: {
          before: 0.23,
          after: 0.09,
        },
        acceptance_rate: 0.80,
        approval_cycle_days: 2.9,
        standardisation: {
          on_global_standard: false,
          conformance: 0.66,
        },
      },
    },
    value_levers: {
      rising_opp_upgraded_hcps: 420,
      rising_opp_weeks_earlier: 9,
      rising_opp_value_per_week: 180,
      declining_effort_calls: 3100,
      declining_effort_cost_per_interaction: 145,
      field_acceptance_override_before: 0.21,
      field_acceptance_override_after: 0.08,
      field_acceptance_planned_calls: 48000,
      field_acceptance_value_per_call: 60,
      maintenance_hourly_rate: 85,
      maintenance_savings_pct: 0.30,
    },
  };

  writeJsonFile('aggregates.json', aggregates);
  return aggregates;
}
