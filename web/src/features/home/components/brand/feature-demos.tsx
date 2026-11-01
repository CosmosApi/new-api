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
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StatusBadge } from '@/components/status-badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { toIntlLocale } from '@/i18n/languages'
import { formatNumber } from '@/lib/format'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

// Small live mock-ups inside the feature cards. All data is illustrative.

const TOOLS = [
  { icon: 'ClaudeCode', name: 'Claude Code' },
  { icon: 'Codex', name: 'Codex' },
  { icon: 'Cursor', name: 'Cursor' },
  { icon: 'CherryStudio', name: 'Cherry Studio' },
  { icon: 'Dify', name: 'Dify' },
  { icon: 'Cline', name: 'Cline' },
  { icon: 'Trae', name: 'Trae' },
  { icon: 'LobeHub', name: 'LobeHub' },
] as const

export function ToolsDemo() {
  return (
    <ul className='grid grid-cols-4 gap-2 md:grid-cols-8'>
      {TOOLS.map((tool) => (
        <li
          key={tool.name}
          title={tool.name}
          className='bg-background hover:border-primary/40 flex aspect-square items-center justify-center rounded-xl border transition-transform duration-300 hover:-translate-y-1'
        >
          <span aria-hidden className='flex'>
            {getLobeIcon(tool.icon, 24)}
          </span>
          <span className='sr-only'>{tool.name}</span>
        </li>
      ))}
    </ul>
  )
}

const KEYS = [
  { id: 'prod', name: 'production', mask: 'sk-••••3f9a', used: 62 },
  { id: 'dev', name: 'dev-laptop', mask: 'sk-••••b21c', used: 18 },
] as const

export function KeysDemo() {
  const { t } = useTranslation()
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    prod: true,
    dev: false,
  })

  return (
    <ul className='flex flex-col gap-2'>
      {KEYS.map((key) => {
        const on = enabled[key.id]
        return (
          <li
            key={key.id}
            className={cn(
              'bg-background rounded-xl border px-3 py-2.5 transition-opacity',
              !on && 'opacity-60'
            )}
          >
            <div className='flex items-center gap-3'>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium'>{key.name}</p>
                <p className='text-muted-foreground font-mono text-xs'>
                  {key.mask}
                </p>
              </div>
              <StatusBadge
                label={on ? t('Enabled') : t('Disabled')}
                variant={on ? 'success' : 'neutral'}
                size='sm'
                copyable={false}
              />
              <Switch
                checked={on}
                onCheckedChange={(checked) =>
                  setEnabled((s) => ({ ...s, [key.id]: checked }))
                }
                aria-label={t('Enable key {{name}}', { name: key.name })}
              />
            </div>
            <Progress
              value={key.used}
              aria-label={t('Quota used')}
              className='mt-2.5'
            />
          </li>
        )
      })}
    </ul>
  )
}

const LOG_SAMPLES = [
  { model: 'claude-sonnet', tokens: 1842 },
  { model: 'gpt-mini', tokens: 512 },
  { model: 'gemini-flash', tokens: 3260 },
  { model: 'deepseek-chat', tokens: 977 },
  { model: 'qwen-plus', tokens: 1405 },
  { model: 'kimi', tokens: 2210 },
] as const
const LOG_ROWS = 4

export function LogsDemo() {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const reduceMotion = useReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduceMotion) {
      return
    }
    const timer = window.setInterval(() => setTick((n) => n + 1), 2200)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  // Newest first; `seq` is a running request number, so it is a stable key.
  const rows = Array.from({ length: LOG_ROWS }, (_, offset) => {
    const seq = tick + LOG_ROWS - 1 - offset
    return { seq, ...LOG_SAMPLES[seq % LOG_SAMPLES.length] }
  })

  return (
    <ul className='flex flex-col gap-1.5 font-mono text-xs'>
      <AnimatePresence initial={false} mode='popLayout'>
        {rows.map((row) => (
          <motion.li
            key={row.seq}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='bg-background flex items-center gap-3 rounded-lg border px-3 py-2'
          >
            <span aria-hidden className='bg-success size-1.5 rounded-full' />
            <span className='flex-1 truncate'>{row.model}</span>
            <span className='text-muted-foreground tabular-nums'>
              {t('{{value}} tokens', {
                value: formatNumber(row.tokens, locale),
              })}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

const METER_DOTS = Array.from({ length: 72 }, (_, i) => i)
const TOKENS_PER_DOT = 250
// Ticks past the last dot: the meter rests full for a moment before restarting.
const METER_HOLD_TICKS = 12

export function MeterDemo() {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const reduceMotion = useReducedMotion()
  const [filled, setFilled] = useState(0)

  useEffect(() => {
    if (reduceMotion) {
      return
    }
    const timer = window.setInterval(() => {
      setFilled((n) => (n >= METER_DOTS.length + METER_HOLD_TICKS ? 0 : n + 1))
    }, 110)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  const shown = reduceMotion ? 44 : Math.min(filled, METER_DOTS.length)

  return (
    <div>
      <div aria-hidden className='grid grid-cols-12 gap-1.5 md:grid-cols-24'>
        {METER_DOTS.map((dot) => (
          <span
            key={dot}
            className={cn(
              'aspect-square rounded-full transition-colors duration-200',
              dot < shown ? 'bg-primary' : 'bg-border'
            )}
          />
        ))}
      </div>
      <p className='text-muted-foreground mt-4 font-mono text-xs tabular-nums'>
        {t('{{value}} tokens', {
          value: formatNumber(shown * TOKENS_PER_DOT, locale),
        })}
      </p>
    </div>
  )
}
