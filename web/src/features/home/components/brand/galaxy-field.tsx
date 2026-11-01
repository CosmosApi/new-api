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
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const ARMS = 3
const TWIST = 3.4
const TILT = (64 * Math.PI) / 180
const ROLL = (-10 * Math.PI) / 180
const PATTERN_SPEED = 0.05
const RIPPLE_SPEED = 0.55
const RIPPLE_WIDTH = 0.08

// Clay outer arms → cream → white core, plus a few hot sparkles.
const BUCKET_COLORS = [
  [232, 120, 64],
  [255, 196, 150],
  [255, 238, 218],
  [255, 255, 255],
] as const
const BUCKET_ALPHA = [0.55, 0.65, 0.8, 1]

interface GalaxyFieldProps {
  className?: string
  /** Bump to send a ring out from the centre. */
  pulse?: number
}

interface Ripple {
  x: number
  y: number
  start: number
}

function gauss() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
}

/**
 * A tilted spiral galaxy drawn as stars on a canvas. Inner stars stream
 * through the arms faster than outer ones while the arm pattern holds.
 * Hovering quickens and brightens the disc; a click sends a density ring
 * outward that briefly lights the stars it passes.
 */
export function GalaxyField(props: GalaxyFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pulseRef = useRef<((x?: number, y?: number) => void) | null>(null)

  useEffect(() => {
    if (props.pulse) pulseRef.current?.()
  }, [props.pulse])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let count = 0
    let r = new Float32Array(0)
    let theta = new Float32Array(0)
    let z = new Float32Array(0)
    let phase = new Float32Array(0)
    let bucket = new Uint8Array(0)
    let raf = 0
    let visible = false
    let hover = 0
    let hoverTarget = 0
    let angle = 0
    let last = performance.now()
    const ripples: Ripple[] = []
    const pointer = { x: 0, y: 0, inside: false }

    const build = () => {
      count = Math.round(Math.min(14000, Math.max(5000, (width * height) / 36)))
      r = new Float32Array(count)
      theta = new Float32Array(count)
      z = new Float32Array(count)
      phase = new Float32Array(count)
      bucket = new Uint8Array(count)
      for (let i = 0; i < count; i++) {
        let rr: number
        let th: number
        if (Math.random() < 0.16) {
          // Central bulge.
          rr = Math.abs(gauss()) * 0.11
          th = Math.random() * Math.PI * 2
          z[i] = gauss() * 0.05
        } else {
          rr = 0.05 + Math.pow(Math.random(), 0.75) * 0.95
          const arm = (Math.floor(Math.random() * ARMS) / ARMS) * Math.PI * 2
          th = arm + TWIST * Math.log(1 + rr * 3) + gauss() * (0.22 + rr * 0.35)
          z[i] = gauss() * 0.02 * (1 - rr)
        }
        r[i] = rr
        theta[i] = th
        phase[i] = Math.random() * Math.PI * 2
        if (Math.random() < 0.05) {
          bucket[i] = 3
        } else if (rr < 0.12) {
          bucket[i] = 2
        } else {
          bucket[i] = rr < 0.4 ? 1 : 0
        }
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      build()
      if (reduced || !raf) draw(performance.now())
    }

    const draw = (now: number) => {
      const t = now / 1000
      const cx = width * 0.5
      const cy = height * 0.66
      const radius = Math.max(width, height) * 0.62
      const cosT = Math.cos(TILT)
      const sinT = Math.sin(TILT)
      const cosR = Math.cos(ROLL)
      const sinR = Math.sin(ROLL)
      const boost = 1 + hover * 0.35

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      // Core haze.
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.32)
      core.addColorStop(0, `rgba(255, 214, 170, ${0.5 * boost})`)
      core.addColorStop(0.4, `rgba(248, 118, 43, ${0.2 * boost})`)
      core.addColorStop(1, 'rgba(248, 118, 43, 0)')
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(ROLL)
      ctx.scale(1, cosT)
      ctx.translate(-cx, -cy)
      ctx.fillStyle = core
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
      ctx.restore()

      for (let b = 0; b < BUCKET_COLORS.length; b++) {
        const [cr, cg, cb] = BUCKET_COLORS[b]
        ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`
        const baseAlpha = BUCKET_ALPHA[b]
        const baseSize = b === 3 ? 1.9 : 1.15
        for (let i = 0; i < count; i++) {
          if (bucket[i] !== b) continue
          const rr = r[i]
          // The pattern turns rigidly; each star drifts along its arm, inner
          // ones faster, so they stream through without winding it up.
          const drift =
            Math.sin(t * (0.5 / (0.15 + rr)) * 0.3 + phase[i]) * 0.12
          const th = theta[i] + angle + drift
          const x0 = Math.cos(th) * rr
          const y0 = Math.sin(th) * rr
          // Tilt around the x axis, then roll on screen.
          const y1 = y0 * cosT - z[i] * sinT
          const depth = y0 * sinT + z[i] * cosT
          let sx = x0 * cosR - y1 * sinR
          let sy = x0 * sinR + y1 * cosR
          sx = cx + sx * radius
          sy = cy + sy * radius

          let lift = 0
          for (const rp of ripples) {
            const age = (now - rp.start) / 1000
            const ring = age * RIPPLE_SPEED * radius
            const dx = sx - rp.x
            const dy = sy - rp.y
            const d = Math.sqrt(dx * dx + dy * dy) || 1
            const band = Math.abs(d - ring) / (RIPPLE_WIDTH * radius)
            if (band < 1) {
              const k = (1 - band) * Math.max(0, 1 - age / 2.2)
              lift = Math.max(lift, k)
              sx += (dx / d) * k * 6
              sy += (dy / d) * k * 6
            }
          }
          if (pointer.inside) {
            const dx = pointer.x - sx
            const dy = pointer.y - sy
            const d2 = dx * dx + dy * dy
            if (d2 < 120 * 120) {
              const k = 1 - Math.sqrt(d2) / 120
              sx += dx * k * 0.08
              sy += dy * k * 0.08
              lift = Math.max(lift, k * 0.5)
            }
          }

          // The far side of the disc dims, the near side reads larger.
          const near = 0.6 - depth * 0.4
          const tw = reduced
            ? 1
            : 0.75 + 0.25 * Math.sin(t * 2.2 + phase[i] * 3)
          ctx.globalAlpha = Math.min(
            1,
            (baseAlpha * near * tw + lift * 0.6) * boost
          )
          const s = baseSize * (0.85 + near * 0.3) * (1 + lift * 0.6)
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s)
        }
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (now: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      hover += (hoverTarget - hover) * 0.06
      angle += dt * PATTERN_SPEED * (1 + hover * 1.4)
      while (ripples.length && now - ripples[0].start > 2400) ripples.shift()
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (!raf && visible && !reduced) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }

    pulseRef.current = (x?: number, y?: number) => {
      if (reduced) return
      ripples.push({
        x: x ?? width * 0.5,
        y: y ?? height * 0.66,
        start: performance.now(),
      })
      if (ripples.length > 4) ripples.shift()
    }

    const host = canvas.parentElement ?? canvas
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.inside = e.pointerType !== 'touch'
      hoverTarget = 1
    }
    const onLeave = () => {
      pointer.inside = false
      hoverTarget = 0
    }
    const onDown = (e: PointerEvent) => {
      // Buttons and links keep their own clicks.
      if ((e.target as HTMLElement).closest('a, button')) return
      const rect = canvas.getBoundingClientRect()
      pulseRef.current?.(e.clientX - rect.left, e.clientY - rect.top)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })
    io.observe(canvas)
    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
      start()
    }
    document.addEventListener('visibilitychange', onVisibility)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)

    return () => {
      pulseRef.current = null
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none block size-full', props.className)}
    />
  )
}
