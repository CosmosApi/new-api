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
import { useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { toIntlLocale } from '@/i18n/languages'
import { formatNumber, formatQuota } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { OverviewRange, TrendBucket } from '../../lib/brand-overview'
import { OverviewCard } from './overview-card'

// Axis labels per range: every nth bar, so labels never collide.
const LABEL_EVERY: Record<OverviewRange, number> = {
  '24h': 6,
  '7d': 1,
  '30d': 5,
}

interface SpendTrendProps {
  range: OverviewRange
  buckets: TrendBucket[]
  totalQuota: number
  className?: string
}

/**
 * Single-colour spend bars. A plain flex chart instead of the chart library:
 * it is one series, needs a custom tooltip, and keeps the bundle light. Bars
 * are a roving-focus group, so the arrow keys walk through them.
 */
export function SpendTrend(props: SpendTrendProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const [active, setActive] = useState<number | null>(null)
  const [focusIndex, setFocusIndex] = useState(props.buckets.length - 1)
  const barRefs = useRef<Array<HTMLButtonElement | null>>([])

  const hourly = props.range === '24h'
  const labelFormat = new Intl.DateTimeFormat(
    locale,
    hourly
      ? { hour: '2-digit', minute: '2-digit' }
      : { month: 'numeric', day: 'numeric' }
  )
  const tooltipFormat = new Intl.DateTimeFormat(
    locale,
    hourly
      ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { weekday: 'short', month: 'short', day: 'numeric' }
  )
  const max = Math.max(...props.buckets.map((b) => b.quota), 0)
  const shown = active === null ? null : props.buckets[active]
  const last = props.buckets.length - 1

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = focusIndex
    if (event.key === 'ArrowRight') next = Math.min(last, focusIndex + 1)
    else if (event.key === 'ArrowLeft') next = Math.max(0, focusIndex - 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return
    event.preventDefault()
    setFocusIndex(next)
    barRefs.current[next]?.focus()
  }

  return (
    <OverviewCard
      title={t('Spend trend')}
      description={t('Total {{spend}}', {
        spend: formatQuota(props.totalQuota),
      })}
      className={props.className}
    >
      <div className='relative'>
        {shown && active !== null && (
          <div
            role='status'
            className={cn(
              'bg-popover text-popover-foreground pointer-events-none absolute bottom-full z-10 mb-2 w-max max-w-56 rounded-lg border px-3 py-2 text-xs shadow-md',
              active < 3 && 'translate-x-0',
              active > last - 3 && '-translate-x-full',
              active >= 3 && active <= last - 3 && '-translate-x-1/2'
            )}
            style={{
              left: `${((active + 0.5) / props.buckets.length) * 100}%`,
            }}
          >
            <p className='text-muted-foreground'>
              {tooltipFormat.format(new Date(shown.start * 1000))}
            </p>
            <p className='font-figure mt-0.5 text-base'>
              {formatQuota(shown.quota)}
            </p>
            <p className='text-muted-foreground'>
              {t('{{count}} calls', {
                count: formatNumber(shown.count, locale),
              })}
            </p>
            {shown.topModels.length > 0 && (
              <ul className='mt-1.5 flex flex-col gap-0.5 border-t pt-1.5'>
                {shown.topModels.map((m) => (
                  <li key={m.model} className='flex justify-between gap-3'>
                    <span className='truncate'>{m.model}</span>
                    <span className='tabular-nums'>{formatQuota(m.quota)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div
          role='group'
          aria-label={t('Spend trend')}
          onKeyDown={moveFocus}
          onPointerLeave={() => setActive(null)}
          className='flex h-48 items-end gap-0.5 sm:gap-1'
        >
          {props.buckets.map((bucket, i) => {
            const height = max > 0 ? (bucket.quota / max) * 100 : 0
            return (
              <button
                key={bucket.start}
                ref={(el) => {
                  barRefs.current[i] = el
                }}
                type='button'
                tabIndex={i === focusIndex ? 0 : -1}
                aria-label={`${tooltipFormat.format(new Date(bucket.start * 1000))}: ${formatQuota(bucket.quota)}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => {
                  setActive(i)
                  setFocusIndex(i)
                }}
                onBlur={() => setActive(null)}
                className='group/bar focus-visible:ring-ring/50 flex h-full flex-1 items-end rounded-sm outline-none focus-visible:ring-2'
              >
                <span
                  className={cn(
                    'w-full rounded-t-sm transition-[height,opacity] duration-500 motion-reduce:transition-none',
                    bucket.quota > 0 ? 'bg-primary' : 'bg-border',
                    active !== null && active !== i && 'opacity-45'
                  )}
                  style={{
                    height: bucket.quota > 0 ? `max(3px, ${height}%)` : '2px',
                  }}
                />
              </button>
            )
          })}
        </div>

        <div
          aria-hidden
          className='text-muted-foreground mt-2 flex gap-0.5 text-[11px] sm:gap-1'
        >
          {props.buckets.map((bucket, i) => (
            <span
              key={bucket.start}
              className='flex-1 overflow-visible whitespace-nowrap'
            >
              {(i % LABEL_EVERY[props.range] === 0 || i === last) &&
                labelFormat.format(new Date(bucket.start * 1000))}
            </span>
          ))}
        </div>
      </div>
    </OverviewCard>
  )
}
