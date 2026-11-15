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

import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { API_KEY_STATUSES } from '@/features/keys/constants'
import { toIntlLocale } from '@/i18n/languages'
import { formatNumber, formatQuota } from '@/lib/format'

import type { KeyUsageRow } from '../../lib/brand-overview'
import { OverviewCard } from './overview-card'

const EXPIRY_WARNING_SECONDS = 7 * 24 * 3600

interface KeyUsageProps {
  rows: KeyUsageRow[]
  loading?: boolean
  now: number
  className?: string
}

/** Spend per API key, so customers see which project is spending. */
export function KeyUsage(props: KeyUsageProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const dateFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <OverviewCard
      title={t('Spend by key')}
      description={t('Which key, and so which project, is spending')}
      actions={
        <Button variant='ghost' size='sm' render={<Link to='/keys' />}>
          {t('Manage keys')}
        </Button>
      }
      className={props.className}
    >
      {!props.loading && props.rows.length === 0 ? (
        <p className='text-muted-foreground py-8 text-center text-sm'>
          {t('No key was used in this period.')}
        </p>
      ) : (
        <ul className='flex flex-col divide-y'>
          {props.rows.map((row) => {
            const status = row.key
              ? API_KEY_STATUSES[row.key.status]
              : undefined
            const expiresAt = row.key?.expired_time ?? -1
            const expiringSoon =
              expiresAt > 0 && expiresAt - props.now < EXPIRY_WARNING_SECONDS
            return (
              <li
                key={row.id}
                className='flex flex-col gap-2 py-3 first:pt-0 last:pb-0'
              >
                <div className='flex items-center gap-2'>
                  <span className='min-w-0 flex-1 truncate text-sm font-medium'>
                    {row.name ?? t('Deleted key')}
                  </span>
                  {status && row.key?.status !== 1 && (
                    <StatusBadge
                      label={t(status.label)}
                      variant={status.variant}
                      size='sm'
                      copyable={false}
                    />
                  )}
                  {expiringSoon && (
                    <StatusBadge
                      label={t('Expires {{date}}', {
                        date: dateFormat.format(new Date(expiresAt * 1000)),
                      })}
                      variant='warning'
                      size='sm'
                      copyable={false}
                    />
                  )}
                  <span className='font-medium tabular-nums'>
                    {formatQuota(row.quota)}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='bg-muted h-1.5 flex-1 overflow-hidden rounded-full'>
                    <span
                      className='bg-primary block h-full rounded-full'
                      style={{ width: `${row.share * 100}%` }}
                    />
                  </span>
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    {t('{{count}} calls', {
                      count: formatNumber(row.count, locale),
                    })}
                  </span>
                  {row.key && !row.key.unlimited_quota && (
                    <span className='text-muted-foreground text-xs tabular-nums'>
                      {t('{{remain}} left', {
                        remain: formatQuota(row.key.remain_quota),
                      })}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </OverviewCard>
  )
}
