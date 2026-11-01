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
import { describe, expect, it } from 'vitest'

import type { ApiKey } from '@/features/keys/types'

import type { FlowQuotaDataItem, QuotaDataItem } from '../../types'
import {
  buildModelBreakdown,
  buildSpendTrend,
  estimateRunway,
  summarizeKeyUsage,
  summarizeUsage,
} from '../brand-overview'

const HOUR = 3600
const DAY = 24 * HOUR
// A fixed instant on the hour, so hourly buckets are exact.
const NOW = 1_800_000_000 - (1_800_000_000 % HOUR)

function row(
  hoursAgo: number,
  model: string,
  quota: number,
  extra: Partial<QuotaDataItem> = {}
): QuotaDataItem {
  return {
    created_at: NOW - hoursAgo * HOUR,
    model_name: model,
    quota,
    count: 1,
    token_used: 1000,
    ...extra,
  }
}

function apiKey(id: number, name: string): ApiKey {
  return {
    id,
    name,
    key: 'x',
    status: 1,
    remain_quota: 0,
    used_quota: 0,
    unlimited_quota: true,
    expired_time: -1,
    created_time: 0,
    accessed_time: 0,
    group: '',
    auto_groups: null,
    cross_group_retry: false,
    model_limits_enabled: false,
    model_limits: '',
    allow_ips: '',
    allow_user_quota_query: false,
  }
}

describe('summarizeUsage', () => {
  it('splits the range from the span before it and reports the spend change', () => {
    const rows = [
      row(2, 'claude', 300),
      row(5, 'gpt', 100),
      row(30, 'claude', 200),
      row(60, 'gpt', 999),
    ]

    const summary = summarizeUsage(rows, '24h', NOW)

    expect(summary.current).toEqual({ quota: 400, count: 2, tokens: 2000 })
    expect(summary.previous).toEqual({ quota: 200, count: 1, tokens: 1000 })
    expect(summary.quotaChange).toBe(1)
    expect(summary.topModel).toEqual({ name: 'claude', share: 0.75 })
  })

  it('reports no change and no top model without usage', () => {
    const summary = summarizeUsage([], '7d', NOW)

    expect(summary.quotaChange).toBeNull()
    expect(summary.topModel).toBeNull()
    expect(summary.current.quota).toBe(0)
  })
})

describe('buildModelBreakdown', () => {
  it('sums each model in the range, biggest spend first, with its share and unit price', () => {
    const rows = [
      row(1, 'gpt', 100, { token_used: 4000 }),
      row(2, 'claude', 300, { token_used: 1000, cache_read_tokens: 50 }),
      row(3, 'gpt', 100, { token_used: 1000 }),
      row(30, 'claude', 999),
    ]

    const breakdown = buildModelBreakdown(rows, '24h', NOW)

    expect(breakdown.map((r) => r.model)).toEqual(['claude', 'gpt'])
    expect(breakdown[0]).toMatchObject({
      quota: 300,
      share: 0.6,
      cacheReadTokens: 50,
      quotaPerMillionTokens: 300_000,
    })
    expect(breakdown[1]).toMatchObject({
      count: 2,
      tokens: 5000,
      quota: 200,
      quotaPerMillionTokens: 40_000,
    })
  })

  it('leaves the unit price empty when a model used no tokens', () => {
    const [entry] = buildModelBreakdown(
      [row(1, 'image', 50, { token_used: 0 })],
      '24h',
      NOW
    )

    expect(entry.quotaPerMillionTokens).toBeNull()
  })
})

describe('buildSpendTrend', () => {
  it('gives the last 24 hours one bucket each, oldest first, ending at this hour', () => {
    const trend = buildSpendTrend(
      [row(0, 'claude', 5), row(23, 'gpt', 7)],
      '24h',
      NOW
    )

    expect(trend).toHaveLength(24)
    expect(trend[23]).toMatchObject({ start: NOW, quota: 5 })
    expect(trend[0]).toMatchObject({ start: NOW - 23 * HOUR, quota: 7 })
  })

  it('gives 7 and 30 day ranges one bucket per local day and keeps the top three models', () => {
    const rows = [
      row(1, 'a', 4),
      row(1, 'b', 3),
      row(1, 'c', 2),
      row(1, 'd', 1),
    ]

    const week = buildSpendTrend(rows, '7d', NOW)
    const month = buildSpendTrend(rows, '30d', NOW)

    expect(week).toHaveLength(7)
    expect(month).toHaveLength(30)
    const filled = week.find((bucket) => bucket.quota > 0)
    expect(filled?.quota).toBe(10)
    expect(filled?.topModels.map((m) => m.model)).toEqual(['a', 'b', 'c'])
    expect(week[6].start).toBeLessThanOrEqual(NOW)
    expect(NOW - week[6].start).toBeLessThan(DAY)
  })
})

describe('estimateRunway', () => {
  const weekOfSpend = Array.from({ length: 7 }, (_, d) =>
    row(d * 24 + 1, 'm', 100)
  )

  it('divides the balance by the average daily spend of the last 7 days', () => {
    const runway = estimateRunway(1000, weekOfSpend, NOW)

    expect(runway.state).toBe('ok')
    expect(runway.averageDailyQuota).toBe(100)
    expect(runway.days).toBe(10)
    expect(runway.depletesAt).toBe(NOW + 10 * DAY)
  })

  it('flags a balance that lasts under three days as low', () => {
    expect(estimateRunway(250, weekOfSpend, NOW).state).toBe('low')
  })

  it('flags an exhausted balance as empty', () => {
    expect(estimateRunway(0, weekOfSpend, NOW)).toMatchObject({
      state: 'empty',
      days: 0,
    })
  })

  it('cannot estimate without recent usage', () => {
    expect(estimateRunway(1000, [row(24 * 10, 'm', 100)], NOW)).toMatchObject({
      state: 'idle',
      days: null,
      depletesAt: null,
    })
  })
})

describe('summarizeKeyUsage', () => {
  it('sums spend per key, names keys from the key list and sorts by spend', () => {
    const flow: FlowQuotaDataItem[] = [
      { token_id: 2, quota: 100, count: 1, model_name: 'a' },
      { token_id: 1, quota: 300, count: 2, model_name: 'a' },
      { token_id: 2, quota: 100, count: 1, model_name: 'b' },
    ]

    const rows = summarizeKeyUsage(flow, [
      apiKey(1, 'production'),
      apiKey(2, 'staging'),
    ])

    expect(rows.map((r) => [r.name, r.quota, r.count])).toEqual([
      ['production', 300, 2],
      ['staging', 200, 2],
    ])
    expect(rows[0].share).toBe(0.6)
  })

  it('falls back to the flow name, then to null, for keys missing from the list', () => {
    const rows = summarizeKeyUsage(
      [
        { token_id: 7, token_name: 'old-key', quota: 10 },
        { token_id: 8, quota: 5 },
      ],
      []
    )

    expect(rows.map((r) => r.name)).toEqual(['old-key', null])
    expect(rows[0].key).toBeNull()
  })
})
