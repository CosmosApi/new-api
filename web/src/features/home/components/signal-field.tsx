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
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PROVIDERS = [
  { name: 'OpenAI', x: 50, y: 11 },
  { name: 'Claude', x: 84, y: 30 },
  { name: 'Gemini', x: 84, y: 70 },
  { name: 'DeepSeek', x: 50, y: 89 },
  { name: 'Qwen', x: 16, y: 70 },
  { name: 'Kimi', x: 16, y: 30 },
] as const

// A halftone disc: rings of points that fade toward the rim.
const RINGS = [
  { r: 17, count: 18, opacity: 0.5, size: 0.42 },
  { r: 22, count: 24, opacity: 0.4, size: 0.4 },
  { r: 27, count: 30, opacity: 0.32, size: 0.38 },
  { r: 32, count: 36, opacity: 0.24, size: 0.36 },
  { r: 37, count: 42, opacity: 0.17, size: 0.34 },
  { r: 42, count: 48, opacity: 0.11, size: 0.32 },
] as const

const DOTS = RINGS.flatMap((ring, ringIndex) =>
  Array.from({ length: ring.count }, (_, index) => {
    const angle = (index / ring.count) * Math.PI * 2 + ringIndex * 0.26
    return {
      key: `${ring.r}-${index}`,
      cx: 50 + Math.cos(angle) * ring.r,
      cy: 50 + Math.sin(angle) * ring.r,
      r: ring.size,
      opacity: ring.opacity,
    }
  })
)

function routePoint(provider: (typeof PROVIDERS)[number], radius: number) {
  const angle = Math.atan2(provider.y - 50, provider.x - 50)
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  }
}

interface SignalFieldProps {
  className?: string
}

/**
 * The hero's routing diagram: one orange point at the centre of a dotted
 * aperture, with a live route out to six upstream providers.
 */
export function SignalField(props: SignalFieldProps) {
  const { t } = useTranslation()
  const rawId = useId()
  const id = rawId.replaceAll(/[^a-zA-Z0-9_-]/g, '')
  const [active, setActive] = useState(0)
  const [interacting, setInteracting] = useState(false)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing || interacting) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % PROVIDERS.length)
    }, 2800)
    return () => window.clearInterval(timer)
  }, [interacting, playing])

  const paused = !playing || interacting
  const selected = PROVIDERS[active]
  const start = routePoint(selected, 9)
  const end = routePoint(selected, 37)

  return (
    <div
      className={cn(
        'pico-field-frame mx-auto w-full max-w-[540px] overflow-hidden rounded-[1.75rem] border',
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
        <div className='pico-field-request flex items-center gap-2 rounded-lg border px-3 py-2.5'>
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

      <div className='pico-field-map relative mx-1 aspect-square select-none'>
        <svg
          aria-hidden
          className='absolute inset-0 size-full overflow-visible'
          viewBox='0 0 100 100'
        >
          <defs>
            <radialGradient id={`core-${id}`} cx='38%' cy='32%' r='72%'>
              <stop offset='0%' stopColor='#FFC46B' />
              <stop offset='55%' stopColor='#F8762B' />
              <stop offset='100%' stopColor='#D97757' />
            </radialGradient>
            <radialGradient id={`halo-${id}`} cx='50%' cy='50%' r='50%'>
              <stop offset='0%' stopColor='#F8762B' stopOpacity='0.2' />
              <stop offset='100%' stopColor='#F8762B' stopOpacity='0' />
            </radialGradient>
          </defs>

          <circle cx='50' cy='50' r='19' fill={`url(#halo-${id})`} />

          {DOTS.map((dot) => (
            <circle
              key={dot.key}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              opacity={dot.opacity}
              className='fill-foreground'
            />
          ))}

          {PROVIDERS.map((provider) => {
            const point = routePoint(provider, 37)
            return (
              <line
                key={provider.name}
                x1={start.x}
                y1={start.y}
                x2={point.x}
                y2={point.y}
                className='pico-field-wire'
              />
            )
          })}

          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            className={cn(
              'pico-field-signal',
              paused && 'pico-field-paused'
            )}
          />

          <circle
            cx='50'
            cy='50'
            r='13'
            className={cn('pico-field-aperture', paused && 'pico-field-paused')}
          />
          <circle
            cx='50'
            cy='50'
            r='12'
            className={cn(
              'pico-field-ripple',
              paused && 'pico-field-paused'
            )}
          />
          <circle
            cx='50'
            cy='50'
            r='12'
            className={cn(
              'pico-field-ripple pico-field-ripple-late',
              paused && 'pico-field-paused'
            )}
          />
          <circle cx='50' cy='50' r='5.4' fill={`url(#core-${id})`} />
          <circle
            cx='50'
            cy='50'
            r='2'
            fill='#FFFCF6'
            opacity='0.9'
          />
        </svg>

        {PROVIDERS.map((provider, index) => {
          const isActive = active === index
          return (
            <Button
              key={provider.name}
              variant='outline'
              className={cn(
                'pico-field-provider absolute h-auto -translate-x-1/2 -translate-y-1/2 gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[10px] tracking-wide sm:px-3 sm:text-[11px]',
                isActive && 'pico-field-provider-active'
              )}
              style={{ left: `${provider.x}%`, top: `${provider.y}%` }}
              aria-pressed={isActive}
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
              <span
                aria-hidden
                className={cn(
                  'size-1 rounded-full transition-colors',
                  isActive ? 'bg-primary' : 'bg-border'
                )}
              />
              {provider.name}
            </Button>
          )
        })}
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
          <span className='text-foreground'>{selected.name}</span>
        </span>
        <span className='text-muted-foreground font-mono'>
          {t('One API. Many possibilities.')}
        </span>
      </div>
    </div>
  )
}
