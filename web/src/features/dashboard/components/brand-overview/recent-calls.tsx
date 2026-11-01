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
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { ModelBadge } from '@/features/usage-logs/components/model-badge'
import type { UsageLog } from '@/features/usage-logs/data/schema'
import { formatModelName } from '@/features/usage-logs/lib/format'
import { toIntlLocale } from '@/i18n/languages'
import {
  formatQuota,
  formatTimestamp,
  formatTimestampRelative,
  formatTokens,
  formatUseTime,
} from '@/lib/format'

import { OverviewCard } from './overview-card'

const LOG_TYPE_ERROR = 5

interface RecentCallsProps {
  logs: UsageLog[]
  loading?: boolean
  className?: string
}

/**
 * The latest calls, refreshed every 30 seconds. The model badge flags a call
 * whose upstream returned a different model than the one requested.
 */
export function RecentCalls(props: RecentCallsProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)

  return (
    <OverviewCard
      title={t('Recent calls')}
      description={t('Refreshes every 30 seconds')}
      actions={
        <Button
          variant='ghost'
          size='sm'
          render={
            <Link to='/usage-logs/$section' params={{ section: 'common' }} />
          }
        >
          {t('View all')}
        </Button>
      }
      className={props.className}
      bodyClassName='px-3 pb-3 pt-2'
    >
      {!props.loading && props.logs.length === 0 ? (
        <p className='text-muted-foreground py-8 text-center text-sm'>
          {t('No calls yet.')}
        </p>
      ) : (
        <ul className='flex flex-col'>
          <AnimatePresence initial={false}>
            {props.logs.map((log) => {
              const model = formatModelName(log)
              const failed = log.type === LOG_TYPE_ERROR
              return (
                <motion.li
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className='hover:bg-muted/40 grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2 text-sm sm:grid-cols-[5.5rem_minmax(0,1fr)_8rem_6rem_4.5rem]'
                >
                  <time
                    dateTime={new Date(log.created_at * 1000).toISOString()}
                    title={formatTimestamp(log.created_at)}
                    className='text-muted-foreground text-xs tabular-nums'
                  >
                    {formatTimestampRelative(log.created_at, 'seconds', locale)}
                  </time>
                  <span className='flex min-w-0 items-center gap-2'>
                    <ModelBadge
                      modelName={model.name}
                      actualModel={model.actualModel}
                      responseModel={model.responseModel}
                    />
                    {failed && (
                      <StatusBadge
                        label={t('Failed')}
                        variant='danger'
                        size='sm'
                        copyable={false}
                      />
                    )}
                  </span>
                  <span className='text-muted-foreground hidden truncate text-xs sm:block'>
                    {log.token_name || '-'}
                  </span>
                  <span className='text-muted-foreground hidden text-right text-xs tabular-nums sm:block'>
                    {formatTokens(log.prompt_tokens + log.completion_tokens)}
                    {' · '}
                    {formatUseTime(log.use_time)}
                  </span>
                  <span className='text-right font-medium tabular-nums'>
                    {failed ? '-' : formatQuota(log.quota)}
                  </span>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </OverviewCard>
  )
}
