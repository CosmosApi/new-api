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

import {
  BRAND_RIPPLE_EVENT,
  type BrandRippleDetail,
} from '../../lib/brand-events'

const Z_FAR = 1
const Z_NEAR = 0.04
const CRUISE = 0.07
const WARP = 9
const HOLLOW = 0.14
const FOCUS = 0.55
const TRAIL = 0.1
const MAX_SIZE = 5
const WAVE_SPEED = 900
const WAVE_WIDTH = 70
const PRESS_BOOST = 6

interface Palette {
  /** Pre-built fill strings: the loop touches up to 1,600 particles a frame,
   *  and formatting a colour per particle is a measurable cost. */
  inkCss: string
  accentCss: string
  alpha: number
  blend: GlobalCompositeOperation
}

// Light theme: navy ink glints on the cream page. Dark theme: cream light.
const LIGHT: Palette = {
  inkCss: 'rgb(20, 26, 48)',
  accentCss: 'rgb(232, 110, 48)',
  alpha: 0.55,
  blend: 'source-over',
}
const DARK: Palette = {
  inkCss: 'rgb(242, 236, 226)',
  accentCss: 'rgb(255, 154, 92)',
  alpha: 1,
  blend: 'lighter',
}

// Backing-store budget for the canvas. A full-bleed hero at 2× DPR on a 4K
// screen asks the compositor for ~10 MP every frame, which is where this
// field starts to drop frames; the glints are blurred enough that rendering
// below the device ratio is invisible.
const MAX_PIXELS = 2_400_000

interface Wave {
  x: number
  y: number
  start: number
}

interface GlimmerFieldProps {
  className?: string
  /**
   * CSS selector, looked up in the field's section, for the element whose
   * centre the vanishing point follows.
   */
  anchor?: string
  /** When the warp-in intro hands over to cruising, in ms after mount. */
  arriveMs?: number
}

/**
 * A field of fine glints flying out from a vanishing point. It arrives out
 * of warp, then cruises; glints catch the light and flash into four-point
 * stars. Holding the pointer down boosts to warp, a click sends a wave of
 * light through the field, and the view leans toward the pointer.
 */
export function GlimmerField(props: GlimmerFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const anchorSelector = props.anchor
  const arriveMs = props.arriveMs ?? 1100

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const anchorEl = anchorSelector
      ? (canvas
          .closest('section')
          ?.querySelector<HTMLElement>(anchorSelector) ?? null)
      : null

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    let dpr = 1
    let width = 0
    let height = 0
    let cx = 0
    let cy = 0
    let scale = 0
    let n = 0
    let sx = new Float32Array(0)
    let sy = new Float32Array(0)
    let sz = new Float32Array(0)
    let seed = new Float32Array(0)
    let accent = new Uint8Array(0)
    let flash = new Float32Array(0)
    let raf = 0
    let visible = false
    let last = performance.now()
    const born = last
    let speed = reduced ? 0 : CRUISE * WARP
    let pressAt = 0
    let pressed = false
    let arrived = false
    const waves: Wave[] = []
    const lean = { x: 0, y: 0, tx: 0, ty: 0 }

    const spawn = (i: number, z: number) => {
      // Uniform over a disc with an empty core, so the middle stays clear.
      const a = Math.random() * Math.PI * 2
      const r = HOLLOW + Math.sqrt(Math.random()) * (1.4 - HOLLOW)
      sx[i] = Math.cos(a) * r * 1.6
      sy[i] = Math.sin(a) * r
      sz[i] = z
      seed[i] = Math.random() * Math.PI * 2
      accent[i] = Math.random() < 0.14 ? 1 : 0
      flash[i] = 0
    }

    const anchor = () => {
      const a = anchorEl
      const rect = canvas.getBoundingClientRect()
      if (!a) {
        cx = width / 2
        cy = height * 0.42
        return
      }
      const ar = a.getBoundingClientRect()
      cx = ar.left + ar.width / 2 - rect.left
      cy = ar.top + ar.height / 2 - rect.top
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      width = rect.width
      height = rect.height
      // Step the device ratio down on large screens so a frame stays inside
      // the pixel budget.
      dpr = Math.min(
        Math.min(window.devicePixelRatio || 1, 2),
        Math.max(1, Math.sqrt(MAX_PIXELS / (width * height)))
      )
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      scale = Math.max(width, height) * 0.5
      anchor()
      const next = Math.round(
        Math.min(1600, Math.max(600, (width * height) / 900))
      )
      if (next !== n) {
        n = next
        sx = new Float32Array(n)
        sy = new Float32Array(n)
        sz = new Float32Array(n)
        seed = new Float32Array(n)
        accent = new Uint8Array(n)
        flash = new Float32Array(n)
        for (let i = 0; i < n; i++) {
          spawn(i, Z_NEAR + Math.random() * (Z_FAR - Z_NEAR))
        }
      }
      if (reduced || !raf) draw(performance.now(), 0)
    }

    const sparkle = (x: number, y: number, len: number) => {
      const w = len * 0.16
      ctx.beginPath()
      ctx.moveTo(x, y - len)
      ctx.lineTo(x + w, y - w)
      ctx.lineTo(x + len, y)
      ctx.lineTo(x + w, y + w)
      ctx.lineTo(x, y + len)
      ctx.lineTo(x - w, y + w)
      ctx.lineTo(x - len, y)
      ctx.lineTo(x - w, y - w)
      ctx.closePath()
      ctx.fill()
    }

    const draw = (now: number, dz: number) => {
      const pal = document.documentElement.classList.contains('dark')
        ? DARK
        : LIGHT
      const t = now / 1000
      const fadeIn = reduced ? 1 : Math.min(1, (now - born) / 500)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = pal.blend
      ctx.lineCap = 'round'

      // Hoisted out of the particle loop: the lean is constant for the whole
      // field, and a projection helper returning tuples allocated thousands
      // of arrays every frame.
      const leanX = lean.x
      const leanY = lean.y
      const focal = scale * 0.18
      const streak = dz * TRAIL * 60
      const hasStreak = streak > 0.002
      const hasWaves = waves.length > 0
      // Last bucket written to the context, so colours are set per run
      // rather than per particle.
      let painted = -1

      for (let i = 0; i < n; i++) {
        const z = sz[i]
        const px = cx + ((sx[i] + leanX * (1 - z)) / z) * focal
        const py = cy + ((sy[i] + leanY * (1 - z)) / z) * focal
        if (px < -40 || px > width + 40 || py < -40 || py > height + 40) {
          continue
        }
        const near = 1 - (z - Z_NEAR) / (Z_FAR - Z_NEAR)
        // Fade in from the distance; out-of-focus glints soften and dim.
        const blur = Math.abs(z - FOCUS)
        let a = Math.min(1, near * 1.6) * (1 - blur * 0.55) * pal.alpha * fadeIn
        if (!reduced) a *= 0.72 + 0.28 * Math.sin(t * 2.3 + seed[i] * 5)
        let lift = 0
        if (hasWaves) {
          for (const w of waves) {
            const ring = ((now - w.start) / 1000) * WAVE_SPEED
            const dx = px - w.x
            const dy = py - w.y
            const d = Math.sqrt(dx * dx + dy * dy)
            const band = Math.abs(d - ring) / WAVE_WIDTH
            if (band < 1) {
              lift = Math.max(lift, 1 - band)
              if (flash[i] <= 0 && Math.random() < 0.08) flash[i] = 1
            }
          }
        }
        a = Math.min(1, a + lift * 0.7)
        if (a < 0.02) continue

        const isAccent = accent[i]
        if (isAccent !== painted) {
          painted = isAccent
          const css = isAccent ? pal.accentCss : pal.inkCss
          ctx.fillStyle = css
          ctx.strokeStyle = css
        }
        const size =
          Math.min(MAX_SIZE, 0.7 + near * near * 3.2) * (1 + blur * 0.9)
        ctx.globalAlpha = a

        // Motion streak back along the line of travel. Far glints project
        // their trail into less than a pixel; those are drawn as dots.
        let trail = false
        if (hasStreak) {
          const qz = Math.min(Z_FAR, z + streak)
          const qx = cx + ((sx[i] + leanX * (1 - qz)) / qz) * focal
          const qy = cy + ((sy[i] + leanY * (1 - qz)) / qz) * focal
          if (Math.abs(qx - px) + Math.abs(qy - py) > 1.2) {
            ctx.lineWidth = Math.max(0.6, size * 0.7)
            ctx.beginPath()
            ctx.moveTo(qx, qy)
            ctx.lineTo(px, py)
            ctx.stroke()
            trail = true
          }
        }
        if (!trail) {
          if (size < 1.8) {
            ctx.fillRect(px - size / 2, py - size / 2, size, size)
          } else {
            ctx.beginPath()
            ctx.arc(px, py, size / 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        if (flash[i] > 0) {
          const f = Math.sin(flash[i] * Math.PI)
          ctx.globalAlpha = Math.min(1, f * 1.1) * fadeIn
          sparkle(px, py, (4 + near * 10) * f)
        }
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const age = now - born
      // Out of warp: decelerate to cruise by the time the wordmark lands.
      let target = CRUISE
      if (age < arriveMs) {
        const k = age / arriveMs
        target = CRUISE * (1 + (WARP - 1) * (1 - k * k))
      } else if (!arrived) {
        arrived = true
        waves.push({ x: cx, y: cy, start: now })
      }
      if (pressed && now - pressAt > 180) target *= PRESS_BOOST
      speed += (target - speed) * Math.min(1, dt * 6)
      const dz = speed * dt
      lean.x += (lean.tx - lean.x) * 0.05
      lean.y += (lean.ty - lean.y) * 0.05
      for (let i = 0; i < n; i++) {
        sz[i] -= dz
        if (sz[i] <= Z_NEAR) {
          spawn(i, Z_FAR)
          continue
        }
        if (flash[i] > 0) {
          flash[i] -= dt * 2.4
        } else if (Math.random() < 0.0009) {
          flash[i] = 1
        }
      }
      while (waves.length && now - waves[0].start > 2500) waves.shift()
      return dz
    }

    let lastDraw = 0
    const loop = (now: number) => {
      raf = 0
      if (!visible) return
      // High-refresh screens fire rAF 120–144 times a second. The field does
      // not need that, so cap it at ~60 fps and leave the headroom to the
      // rest of the page.
      if (now - lastDraw < 15) {
        raf = requestAnimationFrame(loop)
        return
      }
      lastDraw = now
      const dz = step(now)
      draw(now, dz)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (!raf && visible && !reduced) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }

    const host = canvas.parentElement?.parentElement ?? canvas
    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const p = local(e)
      lean.tx = ((p.x - cx) / width) * -0.25
      lean.ty = ((p.y - cy) / height) * -0.18
    }
    const onLeave = () => {
      lean.tx = 0
      lean.ty = 0
      pressed = false
    }
    const isControl = (e: PointerEvent) =>
      (e.target as HTMLElement).closest('a, button, input')
    const onDown = (e: PointerEvent) => {
      if (reduced || isControl(e)) return
      pressed = true
      pressAt = performance.now()
    }
    const onUp = (e: PointerEvent) => {
      if (!pressed) return
      pressed = false
      if (performance.now() - pressAt < 250) {
        const p = local(e)
        waves.push({ x: p.x, y: p.y, start: performance.now() })
        if (waves.length > 5) waves.shift()
      }
    }
    const onRipple = (event: Event) => {
      if (reduced) return
      const d = (event as CustomEvent<BrandRippleDetail>).detail
      if (typeof d?.clientX !== 'number') return
      const rect = canvas.getBoundingClientRect()
      const x = d.clientX - rect.left
      const y = d.clientY - rect.top
      if (x < 0 || y < 0 || x > width || y > height) return
      waves.push({ x, y, start: performance.now() })
      if (waves.length > 5) waves.shift()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    if (anchorEl) ro.observe(anchorEl)
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
    window.addEventListener(BRAND_RIPPLE_EVENT, onRipple)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener(BRAND_RIPPLE_EVENT, onRipple)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [anchorSelector, arriveMs])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none block size-full', props.className)}
    />
  )
}
