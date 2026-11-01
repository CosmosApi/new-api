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
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { toIntlLocale } from '@/i18n/languages'
import { formatCompactNumber, formatNumber, formatQuota } from '@/lib/format'

import type { OverviewRange, UsageSummary } from '../../lib/brand-overview'
import { OverviewCard } from './overview-card'

// One sentence per range so each language can phrase the period naturally.
const SENTENCE_KEYS: Record<OverviewRange, string> = {
  '24h':
    'In the last 24 hours you made <num>{{count}}</num> calls and spent <num>{{spend}}</num>.',
  '7d': 'In the last 7 days you made <num>{{count}}</num> calls and spent <num>{{spend}}</num>.',
  '30d':
    'In the last 30 days you made <num>{{count}}</num> calls and spent <num>{{spend}}</num>.',
}

interface UsageSummaryCardProps {
  range: OverviewRange
  summary: UsageSummary
  className?: string
}

/** The overview's opening line: what was spent, and on what. */
export function UsageSummaryCard(props: UsageSummaryCardProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const { current, quotaChange, topModel } = props.summary
  const percent = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const highlight = <span className='font-figure text-primary' />

  if (current.count === 0) {
    return (
      <OverviewCard className={props.className}>
        <p className='font-serif text-2xl leading-snug font-medium tracking-tight text-balance md:text-3xl'>
          {t('No calls in this period yet.')}
        </p>
        <p className='text-muted-foreground mt-3 text-sm'>
          {t(
            'Create an API key, point your client at this site and your usage will appear here.'
          )}
        </p>
        <Button size='sm' className='group mt-5' render={<Link to='/keys' />}>
          {t('Create API Key')}
          <ArrowRight className='transition-transform group-hover:translate-x-0.5' />
        </Button>
      </OverviewCard>
    )
  }

  const rising = quotaChange !== null && quotaChange > 0
  const ChangeIcon = rising ? ArrowUpRight : ArrowDownRight

  return (
    <OverviewCard className={props.className} bodyClassName='flex flex-col'>
      <p className='font-serif text-2xl leading-snug font-medium tracking-tight text-balance md:text-3xl'>
        <Trans
          t={t}
          i18nKey={SENTENCE_KEYS[props.range]}
          values={{
            count: formatNumber(current.count, locale),
            spend: formatQuota(current.quota),
          }}
          components={{ num: highlight }}
        />
      </p>
      <div className='text-muted-foreground mt-4 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'>
        {topModel && (
          <span>
            <Trans
              t={t}
              i18nKey='<model>{{model}}</model> took {{share}} of it'
              values={{
                model: topModel.name,
                share: percent.format(topModel.share),
              }}
              components={{
                model: <span className='text-foreground font-medium' />,
              }}
            />
          </span>
        )}
        {quotaChange !== null && quotaChange !== 0 && (
          <span className='bg-muted/60 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs'>
            <ChangeIcon aria-hidden className='size-3.5' />
            {rising
              ? t('{{percent}} more than the period before', {
                  percent: percent.format(quotaChange),
                })
              : t('{{percent}} less than the period before', {
                  percent: percent.format(-quotaChange),
                })}
          </span>
        )}
      </div>
      <dl className='mt-auto grid grid-cols-3 gap-4 border-t pt-4'>
        {[
          { label: t('Calls'), value: formatNumber(current.count, locale) },
          {
            label: t('Tokens'),
            value: formatCompactNumber(current.tokens, locale),
          },
          {
            label: t('Average per call'),
            value: formatQuota(current.quota / current.count),
          },
        ].map((item) => (
          <div key={item.label} className='min-w-0'>
            <dt className='text-muted-foreground text-xs'>{item.label}</dt>
            <dd className='font-figure mt-1 truncate text-xl'>{item.value}</dd>
          </div>
        ))}
      </dl>
    </OverviewCard>
  )
}
