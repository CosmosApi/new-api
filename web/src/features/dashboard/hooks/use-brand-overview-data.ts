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
import { useQuery } from '@tanstack/react-query'

import { getApiKeys } from '@/features/keys/api'
import { getUserLogs } from '@/features/usage-logs/api'
import type { UsageLog } from '@/features/usage-logs/data/schema'
import { getSelf } from '@/lib/api'
import { requireServerSuccess } from '@/lib/server-error-message'
import { useAuthStore } from '@/stores/auth-store'

import { getFlowQuotaDates, getUserQuotaDates } from '../api'
import {
  OVERVIEW_FETCH_SECONDS,
  OVERVIEW_RANGE_SECONDS,
  type OverviewRange,
} from '../lib/brand-overview'

const LOG_TYPE_CONSUME = 2
const LOG_TYPE_ERROR = 5
const RECENT_CALL_LIMIT = 8
const RECENT_CALL_REFRESH_MS = 30_000

/** Current Unix second, rounded down to the minute so query keys stay put. */
function nowSeconds(): number {
  const now = Math.floor(Date.now() / 1000)
  return now - (now % 60)
}

/**
 * Hourly usage for the last 60 days: enough for every range plus the span
 * before it. If the operator caps log ranges below that, fall back to the
 * server's own maximum window instead of failing.
 */
export function useOverviewUsage() {
  return useQuery({
    queryKey: ['dashboard', 'brand-overview', 'usage'],
    queryFn: async () => {
      const now = nowSeconds()
      const params = { end_timestamp: now, default_time: 'hour' }
      let res = await getUserQuotaDates({
        ...params,
        start_timestamp: now - OVERVIEW_FETCH_SECONDS,
      })
      if (!res.success) {
        res = await getUserQuotaDates({ ...params, start_timestamp: 0 })
      }
      return { rows: requireServerSuccess(res).data ?? [], now }
    },
    staleTime: 60 * 1000,
  })
}

export interface OverviewAccount {
  quota: number
  usedQuota: number
  requestCount: number
  /** False until the server answered, so onboarding never flashes. */
  loaded: boolean
}

/** Balance and lifetime usage, refreshed from the server, not the session. */
export function useOverviewAccount(): OverviewAccount {
  const sessionUser = useAuthStore((s) => s.auth.user)
  const query = useQuery({
    queryKey: ['dashboard', 'brand-overview', 'self'],
    queryFn: async () => {
      const data = (await getSelf())?.data ?? {}
      return {
        quota: Number(data.quota ?? 0),
        usedQuota: Number(data.used_quota ?? 0),
        requestCount: Number(data.request_count ?? 0),
      }
    },
    staleTime: 60 * 1000,
  })
  return {
    quota: query.data?.quota ?? Number(sessionUser?.quota ?? 0),
    usedQuota: query.data?.usedQuota ?? Number(sessionUser?.used_quota ?? 0),
    requestCount:
      query.data?.requestCount ?? Number(sessionUser?.request_count ?? 0),
    loaded: query.isSuccess,
  }
}

/** Spend per key for the selected range, and the key list to name them. */
export function useOverviewKeyUsage(range: OverviewRange) {
  const flow = useQuery({
    queryKey: ['dashboard', 'brand-overview', 'flow', range],
    queryFn: async () => {
      const now = nowSeconds()
      const res = await getFlowQuotaDates({
        start_timestamp: now - OVERVIEW_RANGE_SECONDS[range],
        end_timestamp: now,
      })
      return requireServerSuccess(res).data ?? []
    },
    staleTime: 60 * 1000,
  })
  const keys = useQuery({
    queryKey: ['dashboard', 'brand-overview', 'keys'],
    queryFn: async () =>
      requireServerSuccess(await getApiKeys({ p: 1, size: 100 })).data?.items ??
      [],
    staleTime: 60 * 1000,
  })
  return {
    flowRows: flow.data ?? [],
    keys: keys.data ?? [],
    loading: flow.isLoading || keys.isLoading,
    keysLoaded: keys.isSuccess,
  }
}

/** The latest billed and failed calls, refreshed while the tab is visible. */
export function useRecentCalls() {
  return useQuery({
    queryKey: ['dashboard', 'brand-overview', 'recent-calls'],
    queryFn: async () => {
      const res = requireServerSuccess(
        await getUserLogs({ p: 1, page_size: 30 })
      )
      const items = (res.data?.items ?? []) as UsageLog[]
      return items
        .filter(
          (log) => log.type === LOG_TYPE_CONSUME || log.type === LOG_TYPE_ERROR
        )
        .slice(0, RECENT_CALL_LIMIT)
    },
    refetchInterval: RECENT_CALL_REFRESH_MS,
    refetchIntervalInBackground: false,
    staleTime: 15 * 1000,
  })
}
