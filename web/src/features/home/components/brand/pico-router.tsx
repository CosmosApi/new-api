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
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  { icon: 'OpenAI', name: 'GPT' },
  { icon: 'Claude', name: 'Claude' },
  { icon: 'Gemini', name: 'Gemini' },
  { icon: 'DeepSeek', name: 'DeepSeek' },
  { icon: 'Qwen', name: 'Qwen' },
  { icon: 'ChatGLM', name: 'GLM' },
  { icon: 'Kimi', name: 'Kimi' },
] as const

const AUTOPLAY_MS = 2600
// Orbit size of each model as a share of the outermost orbit.
// The inner orbit clears the star so planets never cover its label.
const ORBITS = [0.56, 0.63, 0.71, 0.78, 0.86, 0.93, 1]
// Vertical squash of the orbits: how far the system is tilted toward us.
const ORBIT_TILT = 0.5
const STAR_SIZE = 132
// Angular speed of the outer orbit in rad/s; inner orbits run faster.
const BASE_SPEED = 0.2
// How far behind each planet its comet trail reaches, in degrees of its ring.
const TRAIL_DEG = 26

// Vertical centre (percent of the stage) of row i out of n.
function rowPosition(i: number, n: number): number {
  return ((i + 0.5) / n) * 100
}

function orbitGeometry(w: number, h: number) {
  const cx = w * 0.6
  const cy = h * 0.5
  // Leave room for the app column on the left and a chip on the right.
  const rx = Math.max(120, Math.min(w * 0.36 - 24, w * 0.4 - 70))
  return { cx, cy, rx, ry: rx * ORBIT_TILT }
}

interface ModelChipProps {
  model: (typeof MODELS)[number]
  active: boolean
  onPick: () => void
  className?: string
}

function ModelChip(props: ModelChipProps) {
  return (
    <Button
      type='button'
      variant='outline'
      aria-pressed={props.active}
      onClick={props.onPick}
      className={cn(
        // A paper chip rather than a glass disc: it needs its own surface so
        // it reads as an object sitting on the page, not a label stuck to it.
        'bg-card border-border/70 hover:bg-card aria-pressed:border-primary aria-pressed:bg-primary/8 h-9 gap-2 rounded-full px-3 shadow-[0_1px_2px_rgba(20,26,48,0.05)] transition-[box-shadow,border-color,background-color] duration-300 aria-pressed:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_16%,transparent),0_2px_10px_-2px_color-mix(in_oklch,var(--primary)_45%,transparent)]',
        props.className
      )}
    >
      <span aria-hidden className='flex size-4 items-center'>
        {getLobeIcon(props.model.icon, 16)}
      </span>
      {props.model.name}
    </Button>
  )
}

/**
 * Routing diagram drawn as a small solar system: apps stream into the brand
 * star, models orbit it as planets, and a beam follows the planet the
 * request is routed to. It cycles models on its own until the visitor
 * hovers or picks one.
 */
export function PicoRouter() {
  const { t } = useTranslation()
  const brandName = useBrandName()
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [picked, setPicked] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const stageRef = useRef<HTMLDivElement>(null)
  const planetRefs = useRef<(HTMLLIElement | null)[]>([])
  const orbitRefs = useRef<(SVGEllipseElement | null)[]>([])
  const beamRef = useRef<SVGLineElement>(null)
  const beamDotRef = useRef<SVGCircleElement>(null)
  const activeRef = useRef(active)
  const pausedRef = useRef(paused)
  // Spread the planets out so they don't start in a line.
  const anglesRef = useRef(MODELS.map((_, i) => i * 2.35 + 0.6))

  useEffect(() => {
    activeRef.current = active
  }, [active])
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    if (reduceMotion || paused || picked) {
      return
    }
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % MODELS.length)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [reduceMotion, paused, picked])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const geo = orbitGeometry(size.w, size.h)

  // Planets move through refs every frame, outside React rendering.
  useLayoutEffect(() => {
    if (size.w === 0) return
    const { cx, cy, rx, ry } = orbitGeometry(size.w, size.h)
    const place = (now: number) => {
      const angles = anglesRef.current
      for (let i = 0; i < MODELS.length; i++) {
        const el = planetRefs.current[i]
        if (!el) continue
        const f = ORBITS[i]
        const px = cx + Math.cos(angles[i]) * rx * f
        const py = cy + Math.sin(angles[i]) * ry * f
        // sin > 0 is the near half of the orbit: in front of the star.
        const near = (Math.sin(angles[i]) + 1) / 2
        el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%) scale(${0.88 + near * 0.14})`
        el.style.zIndex = near > 0.5 ? '30' : '10'
        el.style.opacity = String(0.72 + near * 0.28)
        // The trail is the ring's own dash, running from the planet backwards.
        const trail = orbitRefs.current[i]
        if (trail) {
          trail.setAttribute(
            'stroke-dashoffset',
            String(TRAIL_DEG - (angles[i] * 180) / Math.PI)
          )
        }
        if (i === activeRef.current) {
          beamRef.current?.setAttribute('x2', String(px))
          beamRef.current?.setAttribute('y2', String(py))
          // The request travels the beam, restarting every 1.4s.
          const dot = beamDotRef.current
          if (dot) {
            const k = ((now % 1400) / 1400) ** 0.85
            const start = STAR_SIZE / 2 / Math.hypot(px - cx, py - cy || 1)
            dot.setAttribute('cx', String(cx + (px - cx) * (start + (1 - start) * k)))
            dot.setAttribute('cy', String(cy + (py - cy) * (start + (1 - start) * k)))
            dot.setAttribute('opacity', String(Math.sin(k * Math.PI) * 0.95))
          }
        }
      }
    }
    place(performance.now())
    if (reduceMotion) return

    let raf = 0
    let last = performance.now()
    let speed = 1
    let visible = true
    const loop = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      // Hovering slows the system so a planet is easy to click.
      speed += ((pausedRef.current ? 0.2 : 1) - speed) * 0.05
      const angles = anglesRef.current
      for (let i = 0; i < MODELS.length; i++) {
        angles[i] += dt * BASE_SPEED * Math.pow(ORBITS[i], -0.8) * speed
      }
      place(now)
      if (visible) raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    })
    if (stageRef.current) io.observe(stageRef.current)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [size, reduceMotion])

  const model = MODELS[active]
  const pick = (i: number) => {
    setActive(i)
    setPicked(true)
  }

  const routingText = (
    <AnimatePresence mode='wait' initial={false}>
      <motion.p
        key={model.name}
        className='text-muted-foreground mt-1 text-[11px] leading-tight'
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {t('Routing to {{model}}', { model: model.name })}
      </motion.p>
    </AnimatePresence>
  )

  return (
    <div className='mx-auto w-full max-w-5xl'>
      {/* Desktop: the orbit system. */}
      <div
        ref={stageRef}
        className='relative hidden h-[460px] lg:block'
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        {size.w > 0 && (
          <>
            <svg
              aria-hidden
              width={size.w}
              height={size.h}
              className='absolute inset-0'
            >
              {APPS.map((app, i) => {
                const y = (rowPosition(i, APPS.length) / 100) * size.h
                const x0 = size.w * 0.2
                const x1 = geo.cx - STAR_SIZE / 2
                const mid = (x0 + x1) / 2
                return (
                  <path
                    key={app.name}
                    d={`M ${x0} ${y} C ${mid} ${y}, ${mid} ${geo.cy}, ${x1} ${geo.cy}`}
                    fill='none'
                    className='brand-flow stroke-primary/40'
                    strokeWidth={1.5}
                  />
                )
              })}
              {/* The thin ink rings the whole system turns inside. Only the
                  routed one is solid; the rest are dotted guides. */}
              {ORBITS.map((f, i) => (
                <ellipse
                  key={MODELS[i].name}
                  cx={geo.cx}
                  cy={geo.cy}
                  rx={geo.rx * f}
                  ry={geo.ry * f}
                  fill='none'
                  strokeDasharray={i === active ? undefined : '1.5 5'}
                  strokeLinecap='round'
                  className={cn(
                    'transition-[stroke] duration-700',
                    i === active
                      ? 'stroke-foreground/28'
                      : 'stroke-foreground/12'
                  )}
                  strokeWidth={1}
                />
              ))}
              {/* A comet trail behind each planet: an arc of the same ring,
                  one dash long, whose offset follows the planet's angle. */}
              {ORBITS.map((f, i) => (
                <ellipse
                  key={`trail-${MODELS[i].name}`}
                  ref={(el) => {
                    orbitRefs.current[i] = el
                  }}
                  cx={geo.cx}
                  cy={geo.cy}
                  rx={geo.rx * f}
                  ry={geo.ry * f}
                  fill='none'
                  pathLength={360}
                  strokeDasharray={`${TRAIL_DEG} ${360 - TRAIL_DEG}`}
                  strokeLinecap='round'
                  className={
                    i === active ? 'stroke-primary' : 'stroke-foreground/25'
                  }
                  strokeWidth={i === active ? 1.75 : 1}
                  opacity={i === active ? 0.8 : 0.4}
                />
              ))}
              <line
                ref={beamRef}
                x1={geo.cx}
                y1={geo.cy}
                x2={geo.cx}
                y2={geo.cy}
                className='brand-flow stroke-primary/70'
                strokeWidth={1.5}
              />
              {/* The request itself, riding the beam. */}
              <circle
                ref={beamDotRef}
                r={3}
                className='fill-primary'
                cx={geo.cx}
                cy={geo.cy}
              />
            </svg>

            <p className='text-muted-foreground absolute top-0 left-0 w-[20%] pb-2 text-right text-xs'>
              {t('Your apps')}
            </p>
            <ul className='absolute inset-y-0 left-0 w-[20%]'>
              {APPS.map((app, i) => (
                <li
                  key={app.name}
                  className='bg-card border-border/70 absolute right-0 flex -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-2 text-sm shadow-[0_1px_2px_rgba(20,26,48,0.05)]'
                  style={{ top: `${rowPosition(i, APPS.length)}%` }}
                >
                  <span aria-hidden className='flex size-4 items-center'>
                    {getLobeIcon(app.icon, 16)}
                  </span>
                  {app.name}
                </li>
              ))}
            </ul>

            {/* The star. */}
            <div
              className='absolute z-20 -translate-x-1/2 -translate-y-1/2'
              style={{
                left: geo.cx,
                top: geo.cy,
                width: STAR_SIZE,
                height: STAR_SIZE,
              }}
            >
              {/* Corona: a warm bloom in the dark, a drawn halo in the light
                  (a big orange glow on cream reads as a smudge, not heat). */}
              <span
                aria-hidden
                className='absolute -inset-14 hidden rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_30%,transparent),transparent_65%)] dark:block'
              />
              <span
                aria-hidden
                className='border-border/60 absolute -inset-6 rounded-full border'
              />
              <span
                aria-hidden
                className='border-border/35 absolute -inset-11 rounded-full border'
              />
              <span
                aria-hidden
                className='brand-pulse border-primary/50 absolute inset-0 rounded-full border'
              />
              <div className='bg-card relative flex size-full flex-col items-center justify-center rounded-full border px-3 text-center shadow-[0_2px_20px_-6px_rgba(20,26,48,0.14)] dark:shadow-[0_0_50px_-8px_rgba(248,118,43,0.55)]'>
                <span
                  aria-hidden
                  className='from-primary/12 pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b to-transparent'
                />
                <PicoMark className='relative h-7' />
                <p className='relative mt-1.5 font-serif text-base leading-none font-medium'>
                  {brandName}
                </p>
                {routingText}
              </div>
            </div>

            <ul>
              {MODELS.map((m, i) => (
                <li
                  key={m.name}
                  ref={(el) => {
                    planetRefs.current[i] = el
                  }}
                  className='absolute top-0 left-0 will-change-transform'
                >
                  <ModelChip
                    model={m}
                    active={i === active}
                    onPick={() => pick(i)}
                    className='backdrop-blur-sm'
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Mobile: hub card with model chips. */}
      <div className='flex flex-col items-center gap-6 lg:hidden'>
        <div className='relative w-56'>
          <span
            aria-hidden
            className='brand-pulse border-primary/50 absolute inset-0 rounded-2xl border'
          />
          <div className='bg-card relative rounded-2xl border px-4 py-5 text-center shadow-[0_2px_20px_-6px_rgba(20,26,48,0.14)]'>
            <PicoMark className='mx-auto h-8' />
            <p className='mt-2 font-serif text-lg font-medium'>{brandName}</p>
            {routingText}
          </div>
        </div>
        <ul className='flex flex-wrap justify-center gap-2'>
          {MODELS.map((m, i) => (
            <li key={m.name}>
              <ModelChip
                model={m}
                active={i === active}
                onPick={() => pick(i)}
              />
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
