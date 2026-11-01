/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
/**
 * Pure aggregation for the PicoAPI overview page. Every function takes the
 * hourly rows from /api/data/self (or /api/data/flow/self) plus an explicit
 * `now` in Unix seconds, so results are deterministic and testable.
 */
import type { ApiKey } from '@/features/keys/types'

import type { FlowQuotaDataItem, QuotaDataItem } from '../types'

export type OverviewRange = '24h' | '7d' | '30d'

const HOUR = 3600
const DAY = 24 * HOUR

export const OVERVIEW_RANGE_SECONDS: Record<OverviewRange, number> = {
  '24h': DAY,
  '7d': 7 * DAY,
  '30d': 30 * DAY,
}

/** The overview fetches the longest range plus an equal span before it. */
export const OVERVIEW_FETCH_SECONDS = 2 * OVERVIEW_RANGE_SECONDS['30d']

const RUNWAY_WINDOW_DAYS = 7
const LOW_RUNWAY_DAYS = 3

export interface PeriodTotals {
  quota: number
  count: number
  tokens: number
}

export interface UsageSummary {
  current: PeriodTotals
  previous: PeriodTotals
  /** Spend change against the previous period as a ratio, or null. */
  quotaChange: number | null
  topModel: { name: string; share: number } | null
}

function emptyTotals(): PeriodTotals {
  return { quota: 0, count: 0, tokens: 0 }
}

function addRow(totals: PeriodTotals, row: QuotaDataItem) {
  totals.quota += Number(row.quota) || 0
  totals.count += Number(row.count) || 0
  totals.tokens += Number(row.token_used) || 0
}

/** Totals for the selected range and for the same span just before it. */
export function summarizeUsage(
  rows: readonly QuotaDataItem[],
  range: OverviewRange,
  now: number
): UsageSummary {
  const span = OVERVIEW_RANGE_SECONDS[range]
  const currentStart = now - span
  const previousStart = currentStart - span
  const current = emptyTotals()
  const previous = emptyTotals()
  const modelQuota = new Map<string, number>()

  for (const row of rows) {
    const ts = Number(row.created_at) || 0
    if (ts >= currentStart && ts <= now) {
      addRow(current, row)
      const name = row.model_name || ''
      modelQuota.set(
        name,
        (modelQuota.get(name) ?? 0) + (Number(row.quota) || 0)
      )
    } else if (ts >= previousStart && ts < currentStart) {
      addRow(previous, row)
    }
  }

  let topName = ''
  let topQuota = 0
  for (const [name, quota] of modelQuota) {
    if (name && quota > topQuota) {
      topName = name
      topQuota = quota
    }
  }

  return {
    current,
    previous,
    quotaChange:
      previous.quota > 0
        ? (current.quota - previous.quota) / previous.quota
        : null,
    topModel: topName
      ? { name: topName, share: topQuota / current.quota }
      : null,
  }
}

export interface ModelBreakdownRow {
  model: string
  count: number
  tokens: number
  quota: number
  cacheReadTokens: number
  /** Share of the range's spend, 0..1. */
  share: number
  /** Spend per million tokens (input and output together), or null. */
  quotaPerMillionTokens: number | null
}

/** One row per model for the selected range, biggest spend first. */
export function buildModelBreakdown(
  rows: readonly QuotaDataItem[],
  range: OverviewRange,
  now: number
): ModelBreakdownRow[] {
  const start = now - OVERVIEW_RANGE_SECONDS[range]
  const byModel = new Map<
    string,
    Omit<ModelBreakdownRow, 'share' | 'quotaPerMillionTokens'>
  >()
  let total = 0

  for (const row of rows) {
    const ts = Number(row.created_at) || 0
    if (ts < start || ts > now || !row.model_name) continue
    const entry = byModel.get(row.model_name) ?? {
      model: row.model_name,
      count: 0,
      tokens: 0,
      quota: 0,
      cacheReadTokens: 0,
    }
    entry.count += Number(row.count) || 0
    entry.tokens += Number(row.token_used) || 0
    entry.quota += Number(row.quota) || 0
    entry.cacheReadTokens += Number(row.cache_read_tokens) || 0
    byModel.set(row.model_name, entry)
    total += Number(row.quota) || 0
  }

  return [...byModel.values()]
    .map((entry) => ({
      ...entry,
      share: total > 0 ? entry.quota / total : 0,
      quotaPerMillionTokens:
        entry.tokens > 0 ? (entry.quota / entry.tokens) * 1_000_000 : null,
    }))
    .sort((a, b) => b.quota - a.quota || a.model.localeCompare(b.model))
}

export interface TrendBucket {
  /** Bucket start, Unix seconds. */
  start: number
  quota: number
  count: number
  /** Biggest spenders in the bucket, at most three. */
  topModels: Array<{ model: string; quota: number }>
}

function bucketStarts(range: OverviewRange, now: number): number[] {
  if (range === '24h') {
    const thisHour = now - (now % HOUR)
    return Array.from({ length: 24 }, (_, i) => thisHour - (23 - i) * HOUR)
  }
  // Local calendar days, so bars line up with the visitor's dates.
  const days = range === '7d' ? 7 : 30
  const today = new Date(now * 1000)
  return Array.from({ length: days }, (_, i) =>
    Math.floor(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (days - 1 - i)
      ).getTime() / 1000
    )
  )
}

/** Spend per hour (24h) or per local day (7d, 30d), oldest first. */
export function buildSpendTrend(
  rows: readonly QuotaDataItem[],
  range: OverviewRange,
  now: number
): TrendBucket[] {
  const starts = bucketStarts(range, now)
  const buckets = starts.map((start) => ({
    start,
    quota: 0,
    count: 0,
    models: new Map<string, number>(),
  }))

  for (const row of rows) {
    const ts = Number(row.created_at) || 0
    if (ts < starts[0] || ts > now) continue
    let index = buckets.length - 1
    while (index > 0 && starts[index] > ts) index--
    const bucket = buckets[index]
    const quota = Number(row.quota) || 0
    bucket.quota += quota
    bucket.count += Number(row.count) || 0
    if (row.model_name) {
      bucket.models.set(
        row.model_name,
        (bucket.models.get(row.model_name) ?? 0) + quota
      )
    }
  }

  return buckets.map((bucket) => ({
    start: bucket.start,
    quota: bucket.quota,
    count: bucket.count,
    topModels: [...bucket.models]
      .map(([model, quota]) => ({ model, quota }))
      .sort((a, b) => b.quota - a.quota)
      .slice(0, 3),
  }))
}

export type RunwayState = 'ok' | 'low' | 'empty' | 'idle'

export interface Runway {
  state: RunwayState
  /** Days the balance lasts at the recent pace, or null without usage. */
  days: number | null
  /** When the balance runs out at that pace, Unix seconds, or null. */
  depletesAt: number | null
  averageDailyQuota: number
}

/** How long the balance lasts at the average pace of the last 7 days. */
export function estimateRunway(
  remainQuota: number,
  rows: readonly QuotaDataItem[],
  now: number
): Runway {
  const start = now - RUNWAY_WINDOW_DAYS * DAY
  let spent = 0
  for (const row of rows) {
    const ts = Number(row.created_at) || 0
    if (ts >= start && ts <= now) spent += Number(row.quota) || 0
  }
  const averageDailyQuota = spent / RUNWAY_WINDOW_DAYS

  if (remainQuota <= 0) {
    return { state: 'empty', days: 0, depletesAt: null, averageDailyQuota }
  }
  if (averageDailyQuota <= 0) {
    return { state: 'idle', days: null, depletesAt: null, averageDailyQuota }
  }
  const days = remainQuota / averageDailyQuota
  return {
    state: days < LOW_RUNWAY_DAYS ? 'low' : 'ok',
    days,
    depletesAt: Math.round(now + days * DAY),
    averageDailyQuota,
  }
}

export interface KeyUsageRow {
  id: number
  /** Null when the key was deleted. */
  name: string | null
  quota: number
  count: number
  share: number
  key: ApiKey | null
}

/** Spend per API key for a flow range, merged with the key list. */
export function summarizeKeyUsage(
  flowRows: readonly FlowQuotaDataItem[],
  keys: readonly ApiKey[]
): KeyUsageRow[] {
  const byId = new Map<number, { quota: number; count: number; name: string }>()
  let total = 0
  for (const row of flowRows) {
    const id = Number(row.token_id) || 0
    if (!id) continue
    const entry = byId.get(id) ?? { quota: 0, count: 0, name: '' }
    entry.quota += Number(row.quota) || 0
    entry.count += Number(row.count) || 0
    entry.name ||= row.token_name ?? ''
    byId.set(id, entry)
    total += Number(row.quota) || 0
  }

  const keyById = new Map(keys.map((key) => [key.id, key]))
  return [...byId]
    .map(([id, entry]) => {
      const key = keyById.get(id) ?? null
      return {
        id,
        name: key?.name || entry.name || null,
        quota: entry.quota,
        count: entry.count,
        share: total > 0 ? entry.quota / total : 0,
        key,
      }
    })
    .sort((a, b) => b.quota - a.quota || a.id - b.id)
}

/** Weeks the activity matrix looks back over, whatever range is selected. */
export const ACTIVITY_WEEKS = 4

export interface ActivityCell {
  /** 0 = Monday ... 6 = Sunday, in the visitor's time zone. */
  weekday: number
  /** 0..23, local time. */
  hour: number
  count: number
  quota: number
}

export interface ActivityMatrix {
  /** 7 rows (Monday first) of 24 cells. */
  rows: ActivityCell[][]
  total: number
  maxCount: number
  peak: ActivityCell | null
  /** Share of calls made Monday to Friday, 0..1. */
  weekdayShare: number
}

/** Calls per local weekday and hour over the last four weeks. */
export function buildActivityMatrix(
  rows: readonly QuotaDataItem[],
  now: number
): ActivityMatrix {
  const matrix: ActivityCell[][] = Array.from({ length: 7 }, (_, weekday) =>
    Array.from({ length: 24 }, (_, hour) => ({
      weekday,
      hour,
      count: 0,
      quota: 0,
    }))
  )
  const start = now - ACTIVITY_WEEKS * 7 * DAY
  let total = 0
  let weekdayCalls = 0

  for (const row of rows) {
    const ts = Number(row.created_at) || 0
    if (ts < start || ts > now) continue
    const date = new Date(ts * 1000)
    const weekday = (date.getDay() + 6) % 7
    const cell = matrix[weekday][date.getHours()]
    const count = Number(row.count) || 0
    cell.count += count
    cell.quota += Number(row.quota) || 0
    total += count
    if (weekday < 5) weekdayCalls += count
  }

  let peak: ActivityCell | null = null
  for (const cell of matrix.flat()) {
    if (cell.count > 0 && (!peak || cell.count > peak.count)) peak = cell
  }

  return {
    rows: matrix,
    total,
    maxCount: peak?.count ?? 0,
    peak,
    weekdayShare: total > 0 ? weekdayCalls / total : 0,
  }
}
