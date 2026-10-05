import { appConfig } from '../config/appConfig';

/**
 * Format a number with thousands separators (e.g. 1,240, 8,000)
 */
export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return val.toLocaleString('en-US');
}

/**
 * Format a percentage to 0–1 decimal places (e.g. 74.2%, 88.0% or 100%)
 * Automatically handles inputs in range 0..1 or 0..100
 */
export function formatPercent(val: number | null | undefined, dp: number = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  const normalized = val > 1 ? val : val * 100;
  return `${normalized.toFixed(dp)}%`;
}

/**
 * Format currency in compact USD format (e.g. $1.2M, $450K, $85)
 */
export function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '$0';

  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (absVal >= 1_000_000) {
    const millions = absVal / 1_000_000;
    return `${sign}$${millions.toFixed(millions >= 10 ? 1 : 2)}M`;
  }
  if (absVal >= 1_000) {
    const thousands = absVal / 1_000;
    return `${sign}$${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
  }

  return `${sign}$${Math.round(absVal).toLocaleString('en-US')}`;
}

/**
 * Format segment age in days label (e.g. "164 days")
 */
export function formatDaysAge(days: number | null | undefined): string {
  if (days === null || days === undefined || isNaN(days)) return '0 days';
  return `${days} days`;
}

/**
 * Compute difference in days relative to demoToday (2026-10-15)
 */
export function getDaysRelativeToDemo(
  dateStr: string,
  demoTodayStr: string = appConfig.demoToday
): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const demoToday = new Date(demoTodayStr);
  const diffTime = demoToday.getTime() - target.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format an ISO date string to a human-readable format (e.g. "15 Oct 2026")
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
