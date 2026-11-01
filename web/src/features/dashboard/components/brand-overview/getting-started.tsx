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
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { useBrandName } from '@/features/home/hooks'
import { useStatus } from '@/hooks/use-status'
import { getUserModels } from '@/lib/api'
import { cn } from '@/lib/utils'

import { OverviewCard } from './overview-card'

interface GettingStartedProps {
  hasKey: boolean
  hasBalance: boolean
  hasCalls: boolean
  onDismiss: () => void
  className?: string
}

/**
 * Three steps for a new account. Shown until every step is done or the
 * visitor dismisses it; the request snippet uses this site's address and a
 * model the account can actually call.
 */
export function GettingStarted(props: GettingStartedProps) {
  const { t } = useTranslation()
  const brandName = useBrandName()
  const { status } = useStatus()
  const models = useQuery({
    queryKey: ['dashboard', 'brand-overview', 'user-models'],
    queryFn: async () => (await getUserModels()).data ?? [],
    staleTime: 5 * 60 * 1000,
  })

  const address =
    typeof status?.server_address === 'string' && status.server_address.trim()
      ? status.server_address.trim()
      : window.location.origin
  const baseUrl = `${address.replace(/\/+$/, '')}/v1`
  const model = models.data?.[0] ?? 'MODEL_NAME'
  const snippet = [
    `curl ${baseUrl}/chat/completions \\`,
    '  -H "Content-Type: application/json" \\',
    '  -H "Authorization: Bearer $API_KEY" \\',
    `  -d '{"model": "${model}", "messages": [{"role": "user", "content": "Hello"}]}'`,
  ].join('\n')

  const steps = [
    {
      id: 'key',
      done: props.hasKey,
      title: t('Create an API key'),
      desc: t('One key per project makes spend easy to tell apart.'),
      action: { label: t('Create API Key'), to: '/keys' as const },
    },
    {
      id: 'balance',
      done: props.hasBalance,
      title: t('Top up your balance'),
      desc: t('Calls are billed per token from your balance.'),
      action: { label: t('Top up'), to: '/wallet' as const },
    },
    {
      id: 'call',
      done: props.hasCalls,
      title: t('Send your first request'),
      desc: t(
        'Use the command below, or point any OpenAI-compatible client at the base URL.'
      ),
      action: { label: t('Open Playground'), to: '/playground' as const },
    },
  ]

  return (
    <OverviewCard
      title={t('Get started with {{name}}', { name: brandName })}
      description={t('{{done}} of 3 steps done', {
        done: steps.filter((s) => s.done).length,
      })}
      actions={
        <Button
          variant='ghost'
          size='icon-sm'
          aria-label={t('Dismiss')}
          onClick={props.onDismiss}
        >
          <X />
        </Button>
      }
      className={props.className}
    >
      <ol className='grid gap-4 md:grid-cols-3'>
        {steps.map((step, i) => (
          <li key={step.id} className='flex gap-3'>
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                step.done
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.done ? <Check aria-hidden className='size-4' /> : i + 1}
            </span>
            <div className='min-w-0'>
              <p
                className={cn(
                  'text-sm font-medium',
                  step.done && 'text-muted-foreground line-through'
                )}
              >
                {step.title}
                {step.done && <span className='sr-only'> ({t('Done')})</span>}
              </p>
              <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed'>
                {step.desc}
              </p>
              {!step.done && (
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  render={<Link to={step.action.to} />}
                >
                  {step.action.label}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className='bg-muted/40 mt-5 rounded-xl border'>
        <div className='flex items-center justify-between gap-3 border-b px-4 py-2'>
          <span className='text-muted-foreground text-xs'>
            {t('Base URL')}:{' '}
            <span className='text-foreground font-mono'>{baseUrl}</span>
          </span>
          <CopyButton
            value={snippet}
            size='sm'
            tooltip={t('Copy code')}
            aria-label={t('Copy code')}
          />
        </div>
        <pre className='overflow-x-auto px-4 py-3 font-mono text-xs leading-6'>
          {snippet}
        </pre>
      </div>
    </OverviewCard>
  )
}
