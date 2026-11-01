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
import { Info } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toIntlLocale } from '@/i18n/languages'
import { formatCompactNumber, formatNumber, formatQuota } from '@/lib/format'
import { getLobeIcon } from '@/lib/lobe-icon'
import { resolveModelProvider } from '@/lib/model-provider'

import type { ModelBreakdownRow } from '../../lib/brand-overview'
import { OverviewCard } from './overview-card'

const COLLAPSED_ROWS = 6

interface ModelReceiptProps {
  rows: ModelBreakdownRow[]
  className?: string
}

/**
 * Spend per model with the effective price per million tokens, so customers
 * can check what they paid against the public price list.
 */
export function ModelReceipt(props: ModelReceiptProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const [expanded, setExpanded] = useState(false)
  const percent = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  })
  const showCache = props.rows.some((row) => row.cacheReadTokens > 0)
  const rows = expanded ? props.rows : props.rows.slice(0, COLLAPSED_ROWS)

  return (
    <OverviewCard
      title={t('Model receipt')}
      description={t('What each model cost in this period')}
      className={props.className}
      bodyClassName='px-2 pb-3 pt-2'
    >
      {props.rows.length === 0 ? (
        <p className='text-muted-foreground px-3 py-8 text-center text-sm'>
          {t('No model usage in this period.')}
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Model')}</TableHead>
                <TableHead className='text-right'>{t('Calls')}</TableHead>
                <TableHead className='text-right'>{t('Tokens')}</TableHead>
                {showCache && (
                  <TableHead className='text-right'>
                    {t('Cache read')}
                  </TableHead>
                )}
                <TableHead className='text-right'>{t('Spend')}</TableHead>
                <TableHead className='w-28'>{t('Share')}</TableHead>
                <TableHead className='text-right'>
                  <span className='inline-flex items-center gap-1'>
                    {t('Per 1M tokens')}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type='button'
                            aria-label={t(
                              'How the price per 1M tokens is worked out'
                            )}
                            className='text-muted-foreground hover:text-foreground'
                          />
                        }
                      >
                        <Info aria-hidden className='size-3.5' />
                      </TooltipTrigger>
                      <TooltipContent className='max-w-64'>
                        {t(
                          'Spend divided by all tokens, input and output together. Compare it with the price list to check your bill.'
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const provider = resolveModelProvider(row.model)
                return (
                  <TableRow key={row.model}>
                    <TableCell className='max-w-56'>
                      <span className='flex items-center gap-2'>
                        <span
                          aria-hidden
                          className='flex size-4 shrink-0 items-center'
                        >
                          {provider?.icon
                            ? getLobeIcon(provider.icon, 16)
                            : null}
                        </span>
                        <span className='truncate font-medium'>
                          {row.model}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                      {formatNumber(row.count, locale)}
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                      {formatCompactNumber(row.tokens, locale)}
                    </TableCell>
                    {showCache && (
                      <TableCell className='text-muted-foreground text-right tabular-nums'>
                        {row.cacheReadTokens > 0
                          ? formatCompactNumber(row.cacheReadTokens, locale)
                          : '-'}
                      </TableCell>
                    )}
                    <TableCell className='text-right font-medium tabular-nums'>
                      {formatQuota(row.quota)}
                    </TableCell>
                    <TableCell>
                      <span className='flex items-center gap-2'>
                        <span className='bg-muted h-1.5 flex-1 overflow-hidden rounded-full'>
                          <span
                            className='bg-primary block h-full rounded-full'
                            style={{ width: `${row.share * 100}%` }}
                          />
                        </span>
                        <span className='text-muted-foreground w-10 text-right text-xs tabular-nums'>
                          {percent.format(row.share)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                      {row.quotaPerMillionTokens === null
                        ? '-'
                        : formatQuota(row.quotaPerMillionTokens)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {props.rows.length > COLLAPSED_ROWS && (
            <Button
              variant='ghost'
              size='sm'
              className='mt-1 ml-1'
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? t('Show fewer')
                : t('Show all {{count}} models', { count: props.rows.length })}
            </Button>
          )}
        </>
      )}
    </OverviewCard>
  )
}
