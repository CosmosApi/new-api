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
import { useTranslation } from 'react-i18next'

import { OverviewCard } from '@/features/dashboard/components/brand-overview/overview-card'
import { toIntlLocale } from '@/i18n/languages'
import { formatQuota } from '@/lib/format'

import type { MonthSpend } from '../../hooks/use-wallet-statement'
import { projectMonth } from '../../lib/statement'

interface MonthSpendCardProps {
  thisMonth: MonthSpend | undefined
  lastMonth: MonthSpend | undefined
  allTime: number
  now: number
  className?: string
}

/** Spend this month so far, where the month is heading, and the totals. */
export function MonthSpendCard(props: MonthSpendCardProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const spent = props.thisMonth?.quota ?? 0
  const projected = props.thisMonth
    ? projectMonth(props.thisMonth, spent, props.now)
    : null
  const last = props.lastMonth?.quota ?? 0
  const percent = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  })

  let pace: string | null = null
  if (projected !== null && last > 0) {
    const change = (projected - last) / last
    pace =
      change >= 0
        ? t(
            'At this pace the month ends near {{spend}}, {{percent}} more than last month.',
            {
              spend: formatQuota(projected),
              percent: percent.format(change),
            }
          )
        : t(
            'At this pace the month ends near {{spend}}, {{percent}} less than last month.',
            {
              spend: formatQuota(projected),
              percent: percent.format(-change),
            }
          )
  } else if (projected !== null) {
    pace = t('At this pace the month ends near {{spend}}.', {
      spend: formatQuota(projected),
    })
  }

  return (
    <OverviewCard
      title={t('Spent this month')}
      className={props.className}
      bodyClassName='flex flex-col pt-3'
    >
      <p className='font-figure text-4xl'>{formatQuota(spent)}</p>
      <p className='text-muted-foreground mt-3 mb-6 text-sm leading-relaxed'>
        {pace ?? t('Spent so far this month.')}
      </p>
      <dl className='mt-auto grid grid-cols-2 gap-4 border-t pt-4'>
        <div>
          <dt className='text-muted-foreground text-xs'>{t('Last month')}</dt>
          <dd className='font-figure mt-1 text-xl'>{formatQuota(last)}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs'>{t('All time')}</dt>
          <dd className='font-figure mt-1 text-xl'>
            {formatQuota(props.allTime)}
          </dd>
        </div>
      </dl>
    </OverviewCard>
  )
}
