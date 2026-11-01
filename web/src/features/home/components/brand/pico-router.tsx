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

import { Button } from '@/components/ui/button'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

import { useBrandName } from '../../hooks'
import { PicoMark } from './primitives'

const APPS = [
  { icon: 'ClaudeCode', name: 'Claude Code' },
  { icon: 'Cursor', name: 'Cursor' },
  { icon: 'CherryStudio', name: 'Cherry Studio' },
  { icon: 'Dify', name: 'Dify' },
] as const

const MODELS = [
  { icon: 'Claude', name: 'Claude' },
  { icon: 'OpenAI', name: 'GPT' },
  { icon: 'Gemini', name: 'Gemini' },
  { icon: 'DeepSeek', name: 'DeepSeek' },
  { icon: 'Qwen', name: 'Qwen' },
  { icon: 'Kimi', name: 'Kimi' },
] as const

const AUTOPLAY_MS = 2600

// Vertical centre (percent of the stage) of row i out of n. Shared by the
// SVG route lines and the absolutely placed chips so both line up.
function rowPosition(i: number, n: number): number {
  return ((i + 0.5) / n) * 100
}

/**
 * Interactive diagram: apps on the left send requests through the brand hub
 * to one model on the right. It cycles models on its own until the visitor
 * hovers or picks one.
 */
export function PicoRouter() {
  const { t } = useTranslation()
  const brandName = useBrandName()
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [picked, setPicked] = useState(false)

  useEffect(() => {
    if (reduceMotion || paused || picked) {
      return
    }
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % MODELS.length)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [reduceMotion, paused, picked])

  const model = MODELS[active]

  return (
    <div className='mx-auto w-full max-w-4xl'>
      <div
        className='relative flex flex-col items-center gap-6 lg:block lg:h-[360px]'
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <svg
          aria-hidden
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          className='absolute inset-0 hidden size-full lg:block'
        >
          {APPS.map((app, i) => {
            const y = rowPosition(i, APPS.length)
            return (
              <path
                key={app.name}
                d={`M 22 ${y} C 31 ${y}, 31 50, 40 50`}
                fill='none'
                vectorEffect='non-scaling-stroke'
                className='brand-flow stroke-primary/45'
                strokeWidth={1.5}
              />
            )
          })}
          {MODELS.map((m, i) => {
            const y = rowPosition(i, MODELS.length)
            const isActive = i === active
            return (
              <path
                key={m.name}
                d={`M 60 50 C 69 50, 69 ${y}, 78 ${y}`}
                fill='none'
                vectorEffect='non-scaling-stroke'
                className={cn(
                  'transition-colors duration-300',
                  isActive ? 'brand-flow stroke-primary' : 'stroke-border'
                )}
                strokeWidth={isActive ? 2 : 1.25}
              />
            )
          })}
        </svg>

        <p className='text-muted-foreground absolute top-0 left-0 hidden w-[22%] -translate-y-full pb-2 text-right text-xs lg:block'>
          {t('Your apps')}
        </p>
        <ul className='absolute inset-y-0 left-0 hidden w-[22%] lg:block'>
          {APPS.map((app, i) => (
            <li
              key={app.name}
              className='bg-background absolute right-0 flex -translate-y-1/2 items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-xs'
              style={{ top: `${rowPosition(i, APPS.length)}%` }}
            >
              <span aria-hidden className='flex size-4 items-center'>
                {getLobeIcon(app.icon, 16)}
              </span>
              {app.name}
            </li>
          ))}
        </ul>

        <div className='relative w-56 lg:absolute lg:top-1/2 lg:left-1/2 lg:w-[20%] lg:-translate-x-1/2 lg:-translate-y-1/2'>
          <span
            aria-hidden
            className='brand-pulse border-primary/50 absolute inset-0 rounded-2xl border'
          />
          <div className='bg-background relative rounded-2xl border px-4 py-5 text-center shadow-sm'>
            <PicoMark className='mx-auto h-8' />
            <p className='mt-2 font-serif text-lg font-medium'>{brandName}</p>
            <AnimatePresence mode='wait' initial={false}>
              <motion.p
                key={model.name}
                className='text-muted-foreground mt-1 text-xs'
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {t('Routing to {{model}}', { model: model.name })}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <ul className='flex flex-wrap justify-center gap-2 lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[22%]'>
          {MODELS.map((m, i) => (
            <li
              key={m.name}
              className='lg:absolute lg:left-0 lg:-translate-y-1/2'
              style={{ top: `${rowPosition(i, MODELS.length)}%` }}
            >
              <Button
                type='button'
                variant='outline'
                aria-pressed={i === active}
                onClick={() => {
                  setActive(i)
                  setPicked(true)
                }}
                className='bg-background aria-pressed:border-primary aria-pressed:bg-primary/10 h-9 gap-2 rounded-xl px-3'
              >
                <span aria-hidden className='flex size-4 items-center'>
                  {getLobeIcon(m.icon, 16)}
                </span>
                {m.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <p className='text-muted-foreground mt-6 text-center text-xs lg:mt-4'>
        {t('Pick a model: the route changes, your key stays the same.')}
      </p>
    </div>
  )
}
