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
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { toIntlLocale } from '@/i18n/languages'
import { formatNumber, formatQuota } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { Runway } from '../../lib/brand-overview'
import { OverviewCard } from './overview-card'

// One dot per day of runway, up to a month.
const RUNWAY_DOTS = 30

const DOT_TONE: Record<Runway['state'], string> = {
  ok: 'bg-primary',
  low: 'bg-warning',
  empty: 'bg-destructive',
  idle: 'bg-primary',
}

interface RunwayCardProps {
  balance: number
  runway: Runway
  className?: string
}

/** Balance and how long it lasts at the recent pace, as a row of dots. */
export function RunwayCard(props: RunwayCardProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const { state, days, depletesAt } = props.runway
  const lit =
    state === 'idle'
      ? 0
      : Math.min(RUNWAY_DOTS, Math.max(0, Math.ceil(days ?? 0)))
  const date = depletesAt
    ? new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
      }).format(new Date(depletesAt * 1000))
    : ''

  let line: string
  if (state === 'empty') {
    line = t('Your balance has run out. Top up to keep your calls going.')
  } else if (state === 'idle') {
    line = t(
      'No calls in the last 7 days, so there is no pace to estimate from.'
    )
  } else if ((days ?? 0) < 1) {
    line = t('At the recent pace this lasts less than a day.')
  } else {
    line = t(
      'At the recent pace this lasts about {{days}} days, until around {{date}}.',
      {
        days: formatNumber(Math.floor(days ?? 0), locale),
        date,
      }
    )
  }

  return (
    <OverviewCard
      title={t('Balance')}
      className={props.className}
      bodyClassName='flex flex-col gap-4 pt-3'
    >
      <p
        className={cn(
          'font-figure text-4xl',
          state === 'empty' && 'text-destructive'
        )}
      >
        {formatQuota(props.balance)}
      </p>
      <div
        role='img'
        aria-label={line}
        className='grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5'
      >
        {Array.from({ length: RUNWAY_DOTS }, (_, i) => (
          <span
            key={`day-${i + 1}`}
            className={cn(
              'aspect-square rounded-full transition-colors duration-500',
              i < lit ? DOT_TONE[state] : 'bg-border'
            )}
            style={{ transitionDelay: `${i * 15}ms` }}
          />
        ))}
      </div>
      <p className='text-muted-foreground text-sm leading-relaxed'>
        {line}
        {(days ?? 0) > RUNWAY_DOTS &&
          ` ${t('Each dot is one day; showing the first 30.')}`}
      </p>
      <Button
        size='sm'
        variant={state === 'ok' || state === 'idle' ? 'outline' : 'default'}
        className='mt-auto self-start'
        render={<Link to='/wallet' />}
      >
        {t('Top up')}
      </Button>
    </OverviewCard>
  )
}
