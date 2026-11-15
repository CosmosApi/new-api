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
import { ArrowRight, Code2, Pause, Play, Radio } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PicoMark } from '@/components/brand/pico-mark'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PROVIDERS = [
  { name: 'OpenAI', x: 50, y: 12 },
  { name: 'Claude', x: 83, y: 31 },
  { name: 'Gemini', x: 83, y: 69 },
  { name: 'DeepSeek', x: 50, y: 88 },
  { name: 'Qwen', x: 17, y: 69 },
  { name: 'Kimi', x: 17, y: 31 },
] as const

interface PicoBloomProps {
  className?: string
}

/** Each flower petal connects to an upstream provider in this routing illustration. */
export function PicoBloom(props: PicoBloomProps) {
  const { t } = useTranslation()
  const [active, setActive] = useState(0)
  const [interacting, setInteracting] = useState(false)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!playing || interacting || preference.matches) return
    const id = window.setInterval(() => {
      setActive((index) => (index + 1) % PROVIDERS.length)
    }, 2800)
    const stopOnReducedMotion = () => {
      if (preference.matches) window.clearInterval(id)
    }
    preference.addEventListener('change', stopOnReducedMotion)
    return () => {
      window.clearInterval(id)
      preference.removeEventListener('change', stopOnReducedMotion)
    }
  }, [interacting, playing])

  return (
    <div
      className={cn(
        'pico-bloom-frame mx-auto w-full max-w-[540px] overflow-hidden rounded-[1.75rem] border',
        props.className
      )}
    >
      <div className='border-border/60 flex items-center justify-between gap-2 border-b px-5 py-3.5'>
        <span className='text-muted-foreground flex items-center gap-2 font-mono text-[10px] tracking-wider'>
          <Radio aria-hidden className='text-primary size-3.5' />
          {t('Routing playground')}
        </span>
        <div className='flex items-center gap-2'>
          <span className='pico-home-caption'>{t('Illustration')}</span>
          <Button
            size='icon-xs'
            variant='ghost'
            aria-label={playing ? t('Pause animation') : t('Play animation')}
            aria-pressed={!playing}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
          </Button>
        </div>
      </div>
      <div className='px-5 pt-5'>
        <div className='pico-bloom-request flex items-center gap-2 rounded-lg border px-3 py-2.5'>
          <Code2
            aria-hidden
            className='text-muted-foreground size-3.5 shrink-0'
          />
          <code className='min-w-0 truncate text-[10px] sm:text-[11px]'>
            POST /v1/chat/completions
          </code>
          <span className='text-muted-foreground ml-auto shrink-0 font-mono text-[9px]'>
            {t('Your app')}
          </span>
        </div>
      </div>
      <div className='pico-bloom-map relative mx-1 aspect-square select-none'>
        <svg
          aria-hidden
          className='absolute inset-0 size-full'
          viewBox='0 0 100 100'
        >
          <circle cx='50' cy='50' r='37' className='pico-bloom-orbit' />
          <circle
            cx='50'
            cy='50'
            r='27'
            className='pico-bloom-orbit pico-bloom-orbit-inner'
          />
          {PROVIDERS.map((provider, index) => (
            <g key={provider.name}>
              <line
                x1='50'
                y1='50'
                x2={provider.x}
                y2={provider.y}
                className='pico-bloom-wire'
              />
              {active === index && (
                <line
                  x1='50'
                  y1='50'
                  x2={provider.x}
                  y2={provider.y}
                  className={cn(
                    'pico-bloom-signal',
                    !playing && 'pico-bloom-signal-paused'
                  )}
                />
              )}
            </g>
          ))}
        </svg>
        <div
          aria-hidden
          className='pico-bloom-halo absolute inset-[27%] rounded-full'
        />
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <PicoMark
            className='pico-bloom-flower w-[35%]'
            activePetal={active}
          />
        </div>
        {PROVIDERS.map((provider, index) => (
          <Button
            key={provider.name}
            variant='outline'
            className={cn(
              'pico-bloom-provider absolute h-auto w-[27%] max-w-[116px] -translate-x-1/2 -translate-y-1/2 flex-col gap-1 rounded-xl px-1 py-2.5 text-[11px] sm:py-3 sm:text-xs',
              active === index && 'pico-bloom-provider-active'
            )}
            style={{ left: `${provider.x}%`, top: `${provider.y}%` }}
            aria-pressed={active === index}
            aria-label={t('Route demo request to {{provider}}', {
              provider: provider.name,
            })}
            onClick={() => setActive(index)}
            onPointerEnter={() => {
              setInteracting(true)
              setActive(index)
            }}
            onPointerLeave={() => setInteracting(false)}
            onFocus={() => {
              setInteracting(true)
              setActive(index)
            }}
            onBlur={() => setInteracting(false)}
          >
            <span>{provider.name}</span>
            <span className='text-muted-foreground flex items-center gap-1 font-mono text-[8px] tracking-wider'>
              <span
                aria-hidden
                className={cn(
                  'size-1 rounded-full',
                  active === index ? 'bg-primary' : 'bg-border'
                )}
              />
              {active === index ? t('Selected route') : t('Provider')}
            </span>
          </Button>
        ))}
      </div>
      <div className='border-border/60 flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3.5 text-[10px]'>
        <span className='text-muted-foreground flex items-center gap-2 font-mono'>
          <span
            className='pico-home-status-dot size-1.5 rounded-full'
            aria-hidden
          />
          {t('Your app')}
          <ArrowRight aria-hidden className='size-3' />
          PicoAPI
          <ArrowRight aria-hidden className='size-3' />
          <span className='text-foreground'>{PROVIDERS[active].name}</span>
        </span>
        <span className='text-muted-foreground font-mono'>
          {t('One API. Many possibilities.')}
        </span>
      </div>
    </div>
  )
}
