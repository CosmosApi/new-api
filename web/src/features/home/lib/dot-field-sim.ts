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
/**
 * Spring physics for the home page dot field. Each dot sits on a grid and is
 * pulled back to its rest point by a damped spring; the pointer pushes dots
 * away and ripples push them outward as a ring passes. Kept free of DOM and
 * canvas code so the behaviour can be tested directly.
 */

export const DOT_SPACING = 22

const POINTER_RADIUS = 120
const POINTER_FORCE = 2600
const SPRING = 90
const DAMPING = 11
const RIPPLE_SPEED = 520
const RIPPLE_WIDTH = 46
const RIPPLE_FORCE = 5200
const RIPPLE_LIFETIME = 1.6
const MAX_STEP = 1 / 30
const SETTLE_EPSILON = 0.02

export interface DotField {
  count: number
  restX: Float32Array
  restY: Float32Array
  offX: Float32Array
  offY: Float32Array
  velX: Float32Array
  velY: Float32Array
  /** 0..1 visibility, fading out toward the edges like a soft mask. */
  fade: Float32Array
  /** 0..1 highlight from the pointer and ripples, recomputed each step. */
  glow: Float32Array
}

export interface Ripple {
  x: number
  y: number
  age: number
}

export interface Pointer {
  x: number
  y: number
}

export function createDotField(width: number, height: number): DotField {
  const cols = Math.max(1, Math.ceil(width / DOT_SPACING) + 1)
  const rows = Math.max(1, Math.ceil(height / DOT_SPACING) + 1)
  const count = cols * rows
  const field: DotField = {
    count,
    restX: new Float32Array(count),
    restY: new Float32Array(count),
    offX: new Float32Array(count),
    offY: new Float32Array(count),
    velX: new Float32Array(count),
    velY: new Float32Array(count),
    fade: new Float32Array(count),
    glow: new Float32Array(count),
  }
  // Centre the grid so both edges get the same margin.
  const startX = (width - (cols - 1) * DOT_SPACING) / 2
  const startY = (height - (rows - 1) * DOT_SPACING) / 2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c
      const x = startX + c * DOT_SPACING
      const y = startY + r * DOT_SPACING
      field.restX[i] = x
      field.restY[i] = y
      // Elliptical falloff centred near the top, like the hero's light.
      const dx = (x - width / 2) / (width * 0.55)
      const dy = (y - height * 0.3) / (height * 0.75)
      field.fade[i] = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy))
    }
  }
  return field
}

/**
 * Advance the simulation by `dt` seconds. Ages and drops finished ripples in
 * place. Returns true while anything is still moving, so the caller can stop
 * its animation loop once the field is at rest.
 */
export function stepDotField(
  field: DotField,
  dt: number,
  pointer: Pointer | null,
  ripples: Ripple[]
): boolean {
  const step = Math.min(dt, MAX_STEP)
  for (const ripple of ripples) {
    ripple.age += step
  }
  for (let k = ripples.length - 1; k >= 0; k--) {
    if (ripples[k].age > RIPPLE_LIFETIME) ripples.splice(k, 1)
  }

  let moving = pointer !== null || ripples.length > 0
  for (let i = 0; i < field.count; i++) {
    const x = field.restX[i] + field.offX[i]
    const y = field.restY[i] + field.offY[i]
    let fx = -SPRING * field.offX[i] - DAMPING * field.velX[i]
    let fy = -SPRING * field.offY[i] - DAMPING * field.velY[i]
    let glow = 0

    if (pointer) {
      const dx = x - pointer.x
      const dy = y - pointer.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < POINTER_RADIUS && dist > 0.001) {
        const strength = 1 - dist / POINTER_RADIUS
        const push = POINTER_FORCE * strength * strength
        fx += (dx / dist) * push
        fy += (dy / dist) * push
        glow = Math.max(glow, strength)
      }
    }

    for (const ripple of ripples) {
      const dx = field.restX[i] - ripple.x
      const dy = field.restY[i] - ripple.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const band = Math.abs(dist - ripple.age * RIPPLE_SPEED)
      if (band < RIPPLE_WIDTH && dist > 0.001) {
        const life = 1 - ripple.age / RIPPLE_LIFETIME
        const strength = (1 - band / RIPPLE_WIDTH) * life
        fx += (dx / dist) * RIPPLE_FORCE * strength
        fy += (dy / dist) * RIPPLE_FORCE * strength
        glow = Math.max(glow, strength)
      }
    }

    field.velX[i] += fx * step
    field.velY[i] += fy * step
    field.offX[i] += field.velX[i] * step
    field.offY[i] += field.velY[i] * step
    field.glow[i] = glow

    if (
      !moving &&
      (Math.abs(field.offX[i]) > SETTLE_EPSILON ||
        Math.abs(field.offY[i]) > SETTLE_EPSILON ||
        Math.abs(field.velX[i]) > SETTLE_EPSILON ||
        Math.abs(field.velY[i]) > SETTLE_EPSILON)
    ) {
      moving = true
    }
  }
  return moving
}
