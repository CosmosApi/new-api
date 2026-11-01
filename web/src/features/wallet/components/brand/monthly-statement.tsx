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
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { OverviewCard } from '@/features/dashboard/components/brand-overview/overview-card'
import { toIntlLocale } from '@/i18n/languages'
import { formatQuota } from '@/lib/format'

import type { MonthSpend } from '../../hooks/use-wallet-statement'

interface MonthlyStatementProps {
  months: MonthSpend[]
  className?: string
}

/**
 * Spend per calendar month, newest first. Each month opens the usage log
 * filtered to that month, so every figure can be traced to its calls.
 */
export function MonthlyStatement(props: MonthlyStatementProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const monthFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  })
  const max = Math.max(...props.months.map((m) => m.quota), 0)
  const newestFirst = [...props.months].reverse()

  return (
    <OverviewCard
      title={t('Monthly statement')}
      description={t(
        'Spend per calendar month. Open a month to see its calls.'
      )}
      className={props.className}
      bodyClassName='px-3 pb-3 pt-2'
    >
      <ul className='flex flex-col'>
        {newestFirst.map((month) => (
          <li key={month.start}>
            <Link
              to='/usage-logs/$section'
              params={{ section: 'common' }}
              search={{
                startTime: month.start * 1000,
                endTime: month.end * 1000,
              }}
              className='hover:bg-muted/50 focus-visible:ring-ring/50 group grid grid-cols-[8.5rem_minmax(0,1fr)_6rem_1rem] items-center gap-3 rounded-lg px-2 py-2.5 text-sm outline-none focus-visible:ring-2'
            >
              <span className='truncate'>
                {monthFormat.format(new Date(month.start * 1000))}
                {month.current && (
                  <span className='text-muted-foreground ml-1.5 text-xs'>
                    {t('so far')}
                  </span>
                )}
              </span>
              <span className='bg-muted h-1.5 overflow-hidden rounded-full'>
                <span
                  className='bg-primary block h-full rounded-full'
                  style={{
                    width: `${max > 0 ? (month.quota / max) * 100 : 0}%`,
                  }}
                />
              </span>
              <span className='text-right font-medium tabular-nums'>
                {formatQuota(month.quota)}
              </span>
              <ChevronRight
                aria-hidden
                className='text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'
              />
            </Link>
          </li>
        ))}
      </ul>
    </OverviewCard>
  )
}
