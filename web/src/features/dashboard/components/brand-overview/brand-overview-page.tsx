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
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionPageLayout } from '@/components/layout'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import {
  useOverviewBalance,
  useOverviewKeyUsage,
  useOverviewUsage,
  useRecentCalls,
} from '../../hooks/use-brand-overview-data'
import { useDashboardContentVisibility } from '../../hooks/use-status-data'
import {
  buildModelBreakdown,
  buildSpendTrend,
  estimateRunway,
  summarizeKeyUsage,
  summarizeUsage,
  type OverviewRange,
} from '../../lib/brand-overview'
import { AnnouncementsPanel } from '../overview/announcements-panel'
import { FAQPanel } from '../overview/faq-panel'
import { PerformanceHealthPanel } from '../overview/performance-health-panel'
import { KeyUsage } from './key-usage'
import { ModelReceipt } from './model-receipt'
import { RecentCalls } from './recent-calls'
import { RunwayCard } from './runway-card'
import { SpendTrend } from './spend-trend'
import { UsageSummaryCard } from './usage-summary'

const RANGE_STORAGE_KEY = 'picoapi:overview:range'
const RANGES: readonly OverviewRange[] = ['24h', '7d', '30d']

function readSavedRange(): OverviewRange {
  try {
    const saved = window.localStorage.getItem(RANGE_STORAGE_KEY)
    return RANGES.includes(saved as OverviewRange)
      ? (saved as OverviewRange)
      : '7d'
  } catch {
    return '7d'
  }
}

/**
 * PicoAPI overview: the account read as a bill. What was spent, on which
 * models and keys, how long the balance lasts, and the latest calls.
 */
export function BrandOverviewPage() {
  const { t } = useTranslation()
  const isAdmin = useAuthStore((s) => (s.auth.user?.role ?? 0) >= ROLE.ADMIN)
  const [range, setRange] = useState<OverviewRange>(readSavedRange)
  const usage = useOverviewUsage()
  const balance = useOverviewBalance()
  const keyUsage = useOverviewKeyUsage(range)
  const recent = useRecentCalls()
  const visibility = useDashboardContentVisibility()

  const rows = usage.data?.rows
  const now = usage.data?.now ?? Math.floor(Date.now() / 1000)
  const derived = useMemo(() => {
    const data = rows ?? []
    return {
      summary: summarizeUsage(data, range, now),
      breakdown: buildModelBreakdown(data, range, now),
      trend: buildSpendTrend(data, range, now),
      runway: estimateRunway(balance, data, now),
    }
  }, [rows, range, now, balance])
  const keyRows = useMemo(
    () => summarizeKeyUsage(keyUsage.flowRows, keyUsage.keys),
    [keyUsage.flowRows, keyUsage.keys]
  )

  const changeRange = (next: OverviewRange) => {
    setRange(next)
    try {
      window.localStorage.setItem(RANGE_STORAGE_KEY, next)
    } catch {
      // Private mode or full storage: the choice just is not remembered.
    }
  }
  const rangeLabels: Record<OverviewRange, string> = {
    '24h': t('24 hours'),
    '7d': t('7 days'),
    '30d': t('30 days'),
  }
  const showContent = visibility.announcements || visibility.faq

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Overview')}</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <ToggleGroup
          value={[range]}
          onValueChange={(values) => {
            const next = values[0] as OverviewRange | undefined
            if (next && RANGES.includes(next)) changeRange(next)
          }}
          variant='outline'
          size='sm'
          aria-label={t('Time range')}
        >
          {RANGES.map((value) => (
            <ToggleGroupItem key={value} value={value}>
              {rangeLabels[value]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        {usage.isLoading ? (
          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]'>
            <Skeleton className='h-44 rounded-2xl' />
            <Skeleton className='h-44 rounded-2xl' />
            <Skeleton className='h-72 rounded-2xl lg:col-span-2' />
          </div>
        ) : (
          <CardStaggerContainer className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]'>
            <CardStaggerItem>
              <UsageSummaryCard
                range={range}
                summary={derived.summary}
                className='h-full'
              />
            </CardStaggerItem>
            <CardStaggerItem>
              <RunwayCard
                balance={balance}
                runway={derived.runway}
                className='h-full'
              />
            </CardStaggerItem>
            <CardStaggerItem className='lg:col-span-2'>
              <SpendTrend
                range={range}
                buckets={derived.trend}
                totalQuota={derived.summary.current.quota}
              />
            </CardStaggerItem>
            <CardStaggerItem className='lg:col-span-2'>
              <div className='grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
                <ModelReceipt rows={derived.breakdown} />
                <KeyUsage rows={keyRows} loading={keyUsage.loading} now={now} />
              </div>
            </CardStaggerItem>
            <CardStaggerItem className='lg:col-span-2'>
              <RecentCalls
                logs={recent.data ?? []}
                loading={recent.isLoading}
              />
            </CardStaggerItem>
            {showContent && (
              <CardStaggerItem className='lg:col-span-2'>
                <div className='grid gap-4 lg:grid-cols-2'>
                  {visibility.announcements && <AnnouncementsPanel />}
                  {visibility.faq && <FAQPanel />}
                </div>
              </CardStaggerItem>
            )}
            {isAdmin && (
              <CardStaggerItem className='lg:col-span-2'>
                <PerformanceHealthPanel />
              </CardStaggerItem>
            )}
          </CardStaggerContainer>
        )}
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
