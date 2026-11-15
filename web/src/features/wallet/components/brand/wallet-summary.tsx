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
import { useMemo } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { RunwayCard } from '@/features/dashboard/components/brand-overview/runway-card'
import { estimateRunway } from '@/features/dashboard/lib/brand-overview'

import {
  useMonthlySpend,
  useRunwayUsage,
} from '../../hooks/use-wallet-statement'
import type { UserWalletData } from '../../types'
import { MonthSpendCard } from './month-spend-card'

interface WalletSummaryProps {
  user: UserWalletData | null
  loading?: boolean
}

/**
 * Top of the PicoAPI wallet: balance with its runway, and this month's
 * spend. Replaces the three number tiles the overview already shows.
 */
export function WalletSummary(props: WalletSummaryProps) {
  const runwayUsage = useRunwayUsage()
  const monthly = useMonthlySpend()
  const balance = props.user?.quota ?? 0
  const now = runwayUsage.data?.now ?? Math.floor(Date.now() / 1000)
  const runway = useMemo(
    () => estimateRunway(balance, runwayUsage.data?.rows ?? [], now),
    [balance, runwayUsage.data?.rows, now]
  )
  const months = monthly.data?.months ?? []

  if (props.loading && !props.user) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-56 rounded-2xl' />
        <Skeleton className='h-56 rounded-2xl' />
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <RunwayCard
        balance={balance}
        runway={runway}
        hideTopUp
        className='h-full'
      />
      <MonthSpendCard
        thisMonth={months.at(-1)}
        lastMonth={months.at(-2)}
        allTime={props.user?.used_quota ?? 0}
        now={monthly.data?.now ?? now}
        className='h-full'
      />
    </div>
  )
}
