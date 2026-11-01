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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { toIntlLocale } from '@/i18n/languages'
import { formatNumber, formatQuota } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { ActivityCell, ActivityMatrix } from '../../lib/brand-overview'
import { OverviewCard } from './overview-card'

// 4 January 2027 is a Monday; used only to print localised weekday and
// hour names.
const MONDAY = { year: 2027, month: 0, day: 4 }
const HOUR_TICKS = new Set([0, 6, 12, 18])

interface ActivityHeatmapProps {
  matrix: ActivityMatrix
  /** Current Unix second, to ring the slot the visitor is in now. */
  now: number
  className?: string
}

/**
 * Calls per weekday and hour as a dot matrix, the home page's dot motif put
 * to work: a bigger, deeper dot means more calls in that slot. The grid is
 * decorative for assistive tech; the sentence below it carries the finding.
 */
export function ActivityHeatmap(props: ActivityHeatmapProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const [hovered, setHovered] = useState<ActivityCell | null>(null)
  const { rows, maxCount, peak, total, weekdayShare } = props.matrix

  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const hourFormat = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const weekdayName = (weekday: number) =>
    weekdayFormat.format(
      new Date(MONDAY.year, MONDAY.month, MONDAY.day + weekday)
    )
  const hourName = (hour: number) =>
    hourFormat.format(new Date(MONDAY.year, MONDAY.month, MONDAY.day, hour))
  const percent = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  })

  const nowDate = new Date(props.now * 1000)
  const nowWeekday = (nowDate.getDay() + 6) % 7
  const nowHour = nowDate.getHours()

  const insight = peak
    ? t(
        'Busiest slot: {{weekday}} {{start}}–{{end}}. Weekdays account for {{share}} of calls.',
        {
          weekday: weekdayName(peak.weekday),
          start: hourName(peak.hour),
          end: hourName((peak.hour + 1) % 24),
          share: percent.format(weekdayShare),
        }
      )
    : t('No calls in the last 4 weeks.')

  return (
    <OverviewCard
      title={t('Activity')}
      description={t('Calls by weekday and hour, last 4 weeks')}
      className={props.className}
    >
      <div aria-hidden onPointerLeave={() => setHovered(null)}>
        <div className='grid grid-cols-[2.75rem_repeat(24,minmax(0,1fr))] gap-y-1'>
          {rows.map((row, weekday) => (
            <div key={weekdayName(weekday)} className='contents'>
              <span className='text-muted-foreground flex items-center text-[11px]'>
                {weekdayName(weekday)}
              </span>
              {row.map((cell) => {
                const ratio = maxCount > 0 ? cell.count / maxCount : 0
                const size = cell.count > 0 ? 30 + 62 * Math.sqrt(ratio) : 22
                const isNow = weekday === nowWeekday && cell.hour === nowHour
                const isHovered =
                  hovered?.weekday === cell.weekday &&
                  hovered.hour === cell.hour
                return (
                  <span
                    key={cell.hour}
                    onPointerEnter={() => setHovered(cell)}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-full',
                      isNow && 'ring-primary/60 ring-1'
                    )}
                  >
                    <span
                      className={cn(
                        'rounded-full transition-transform duration-200',
                        cell.count > 0 ? 'bg-primary' : 'bg-border',
                        isHovered && 'scale-125'
                      )}
                      style={{
                        width: `${size}%`,
                        height: `${size}%`,
                        opacity: cell.count > 0 ? 0.35 + 0.65 * ratio : 1,
                      }}
                    />
                    {isHovered && (
                      <span
                        className={cn(
                          'bg-popover text-popover-foreground pointer-events-none absolute bottom-full z-10 mb-1.5 w-max rounded-lg border px-2.5 py-1.5 text-xs shadow-md',
                          cell.hour < 3 && 'left-0',
                          cell.hour > 20 && 'right-0',
                          cell.hour >= 3 &&
                            cell.hour <= 20 &&
                            'left-1/2 -translate-x-1/2'
                        )}
                      >
                        <span className='text-muted-foreground block'>
                          {weekdayName(cell.weekday)} {hourName(cell.hour)}
                        </span>
                        <span className='block'>
                          {t('{{count}} calls', {
                            count: formatNumber(cell.count, locale),
                          })}
                          {cell.quota > 0 && ` · ${formatQuota(cell.quota)}`}
                        </span>
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          ))}
          <span />
          {Array.from({ length: 24 }, (_, hour) => (
            <span
              key={`tick-${hour}`}
              className='text-muted-foreground mt-1 text-[11px] whitespace-nowrap'
            >
              {HOUR_TICKS.has(hour) ? hourName(hour) : ''}
            </span>
          ))}
        </div>
      </div>
      <p className='text-muted-foreground mt-4 text-sm'>
        {insight}
        {total > 0 &&
          ` ${t('{{count}} calls in total.', { count: formatNumber(total, locale) })}`}
      </p>
    </OverviewCard>
  )
}
