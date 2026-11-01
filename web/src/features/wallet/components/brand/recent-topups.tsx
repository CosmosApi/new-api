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

import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { OverviewCard } from '@/features/dashboard/components/brand-overview/overview-card'
import { formatCurrencyFromUSD } from '@/lib/currency'
import { formatNumber } from '@/lib/format'

import {
  formatTimestamp,
  getPaymentMethodName,
  getStatusConfig,
} from '../../lib/billing'
import type { TopupRecord } from '../../types'

interface RecentTopupsProps {
  records: TopupRecord[]
  loading?: boolean
  onOpenHistory: () => void
  className?: string
}

/** The latest top-up orders, with the full history one click away. */
export function RecentTopups(props: RecentTopupsProps) {
  const { t } = useTranslation()

  return (
    <OverviewCard
      title={t('Recent top-ups')}
      actions={
        <Button variant='ghost' size='sm' onClick={props.onOpenHistory}>
          {t('Order history')}
        </Button>
      }
      className={props.className}
      bodyClassName='px-3 pb-3 pt-2'
    >
      {!props.loading && props.records.length === 0 ? (
        <p className='text-muted-foreground px-2 py-8 text-center text-sm'>
          {t('No top-ups yet.')}
        </p>
      ) : (
        <ul className='flex flex-col divide-y'>
          {props.records.map((record) => {
            const status = getStatusConfig(record.status)
            return (
              <li
                key={record.id}
                className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-2 py-2.5 text-sm'
              >
                <span className='flex min-w-0 items-center gap-2'>
                  <span className='truncate font-medium'>
                    {formatCurrencyFromUSD(record.amount, {
                      digitsLarge: 2,
                      digitsSmall: 2,
                      abbreviate: false,
                    })}
                  </span>
                  {record.status !== 'success' && (
                    <StatusBadge
                      label={t(status.label)}
                      variant={status.variant}
                      size='sm'
                      copyable={false}
                    />
                  )}
                </span>
                <span className='text-muted-foreground text-right text-xs tabular-nums'>
                  {t('Paid {{money}}', { money: formatNumber(record.money) })}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  {getPaymentMethodName(record.payment_method, t)}
                </span>
                <span className='text-muted-foreground text-right text-xs tabular-nums'>
                  {formatTimestamp(record.create_time)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </OverviewCard>
  )
}
