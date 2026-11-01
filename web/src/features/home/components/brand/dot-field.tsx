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
import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'

import { useThemeColor } from '@/lib/theme-color'
import { cn } from '@/lib/utils'

import {
  BRAND_RIPPLE_EVENT,
  type BrandRippleDetail,
} from '../../lib/brand-events'
import {
  createDotField,
  stepDotField,
  type Pointer,
  type Ripple,
} from '../../lib/dot-field-sim'

interface DotFieldProps {
  className?: string
  children: ReactNode
}

/**
 * Section backdrop: a canvas dot grid. Dots scatter away from the pointer and
 * spring back, a click (or a brand ripple event from inside the section)
 * sends a ring through them, and dots near either turn clay. The loop sleeps
 * once every dot is at rest and while the section is off screen.
 */
export function DotField(props: DotFieldProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()
  const ink = useThemeColor('--foreground')
  const accent = useThemeColor('--primary')

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!section || !canvas || !ctx || !ink || !accent) {
      return
    }

    let field = createDotField(1, 1)
    let width = 0
    let height = 0
    let pointer: Pointer | null = null
    const ripples: Ripple[] = []
    let frame = 0
    let last = 0
    let visible = true

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = ink
      for (let i = 0; i < field.count; i++) {
        const fade = field.fade[i]
        if (fade < 0.02) continue
        ctx.globalAlpha = fade * 0.22
        ctx.beginPath()
        ctx.arc(
          field.restX[i] + field.offX[i],
          field.restY[i] + field.offY[i],
          1,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
      ctx.fillStyle = accent
      for (let i = 0; i < field.count; i++) {
        const glow = field.glow[i]
        if (glow < 0.02) continue
        ctx.globalAlpha = (0.35 + 0.65 * field.fade[i]) * glow
        ctx.beginPath()
        ctx.arc(
          field.restX[i] + field.offX[i],
          field.restY[i] + field.offY[i],
          1 + 1.6 * glow,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      frame = 0
      const dt = last ? (now - last) / 1000 : 1 / 60
      last = now
      const moving = stepDotField(field, dt, pointer, ripples)
      draw()
      if (moving && visible) {
        frame = window.requestAnimationFrame(tick)
      } else {
        last = 0
      }
    }

    const wake = () => {
      if (!frame && visible && !reduceMotion) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    const resize = () => {
      const rect = section.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      field = createDotField(width, height)
      draw()
    }

    const toLocal = (clientX: number, clientY: number): Pointer => {
      const rect = section.getBoundingClientRect()
      return { x: clientX - rect.left, y: clientY - rect.top }
    }
    const onPointerMove = (event: PointerEvent) => {
      pointer = toLocal(event.clientX, event.clientY)
      wake()
    }
    const onPointerLeave = () => {
      pointer = null
      wake()
    }
    const onPointerDown = (event: PointerEvent) => {
      ripples.push({ ...toLocal(event.clientX, event.clientY), age: 0 })
      wake()
    }
    const onRipple = (event: Event) => {
      const detail = (event as CustomEvent<BrandRippleDetail>).detail
      ripples.push({ ...toLocal(detail.clientX, detail.clientY), age: 0 })
      wake()
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(section)

    if (reduceMotion) {
      return () => resizeObserver.disconnect()
    }

    const visibilityObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            wake()
          })
    visibilityObserver?.observe(section)
    section.addEventListener('pointermove', onPointerMove)
    section.addEventListener('pointerleave', onPointerLeave)
    section.addEventListener('pointerdown', onPointerDown)
    section.addEventListener(BRAND_RIPPLE_EVENT, onRipple)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver?.disconnect()
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerleave', onPointerLeave)
      section.removeEventListener('pointerdown', onPointerDown)
      section.removeEventListener(BRAND_RIPPLE_EVENT, onRipple)
    }
  }, [ink, accent, reduceMotion])

  return (
    <section
      ref={sectionRef}
      className={cn('relative isolate overflow-hidden', props.className)}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent)_0%,transparent_70%)]'
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 size-full'
      />
      {props.children}
    </section>
  )
}
