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

import { getUserQuotaDates } from '@/features/dashboard/api'
import { getUserLogStats } from '@/features/usage-logs/api'
import { requireServerSuccess } from '@/lib/server-error-message'

import { getUserBillingHistory } from '../api'
import { statementMonths, type StatementMonth } from '../lib/statement'
import type { TopupRecord } from '../types'

const STATEMENT_MONTHS = 6
const RECENT_TOPUPS = 5
const RUNWAY_WINDOW = 7 * 24 * 3600
const LOG_TYPE_CONSUME = 2

export interface MonthSpend extends StatementMonth {
  quota: number
}

function nowSeconds(): number {
  const now = Math.floor(Date.now() / 1000)
  return now - (now % 60)
}

/**
 * Spend per calendar month for the last six months. One stat request per
 * month: the server sums the logs, so this stays light however busy the
 * account is.
 */
export function useMonthlySpend() {
  return useQuery({
    queryKey: ['wallet', 'statement', 'months'],
    queryFn: async () => {
      const now = nowSeconds()
      const months = statementMonths(STATEMENT_MONTHS, now)
      const totals = await Promise.all(
        months.map(async (month) => {
          const res = await getUserLogStats({
            type: LOG_TYPE_CONSUME,
            start_timestamp: month.start,
            end_timestamp: month.end,
          })
          // A month outside the operator's log range reads as no spend.
          return res.success ? Number(res.data?.quota ?? 0) : 0
        })
      )
      return {
        now,
        months: months.map((month, i) => ({ ...month, quota: totals[i] })),
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/** Hourly usage of the last 7 days, the window the runway is paced on. */
export function useRunwayUsage() {
  return useQuery({
    queryKey: ['wallet', 'statement', 'runway'],
    queryFn: async () => {
      const now = nowSeconds()
      const res = await getUserQuotaDates({
        start_timestamp: now - RUNWAY_WINDOW,
        end_timestamp: now,
        default_time: 'hour',
      })
      return { now, rows: requireServerSuccess(res).data ?? [] }
    },
    staleTime: 60 * 1000,
  })
}

/** The latest top-up orders. */
export function useRecentTopups() {
  return useQuery({
    queryKey: ['wallet', 'statement', 'topups'],
    queryFn: async (): Promise<TopupRecord[]> => {
      const res = requireServerSuccess(
        await getUserBillingHistory(1, RECENT_TOPUPS)
      )
      return res.data?.items ?? []
    },
    staleTime: 60 * 1000,
  })
}
