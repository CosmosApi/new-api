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
import { describe, expect, it } from 'vitest'

import {
  createDotField,
  DOT_SPACING,
  stepDotField,
  type DotField,
  type Ripple,
} from '../dot-field-sim'

function nearestDot(field: DotField, x: number, y: number): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < field.count; i++) {
    const d = Math.hypot(field.restX[i] - x, field.restY[i] - y)
    if (d < bestDist) {
      best = i
      bestDist = d
    }
  }
  return best
}

function run(
  field: DotField,
  seconds: number,
  pointer: { x: number; y: number } | null,
  ripples: Ripple[] = []
): boolean {
  let moving = true
  for (let t = 0; t < seconds; t += 1 / 60) {
    moving = stepDotField(field, 1 / 60, pointer, ripples)
  }
  return moving
}

describe('dot field simulation', () => {
  it('pushes a dot away from a nearby pointer and lights it', () => {
    const field = createDotField(440, 440)
    const dot = nearestDot(field, 220, 220)
    const pointer = {
      x: field.restX[dot] - DOT_SPACING,
      y: field.restY[dot],
    }

    run(field, 0.3, pointer)

    expect(field.offX[dot]).toBeGreaterThan(1)
    expect(field.glow[dot]).toBeGreaterThan(0)
  })

  it('leaves dots outside the pointer radius at rest', () => {
    const field = createDotField(880, 440)
    const far = nearestDot(field, 860, 220)

    run(field, 0.3, { x: 20, y: 220 })

    expect(field.offX[far]).toBe(0)
    expect(field.offY[far]).toBe(0)
  })

  it('springs back and reports rest once the pointer leaves', () => {
    const field = createDotField(440, 440)
    const dot = nearestDot(field, 220, 220)
    run(field, 0.3, { x: field.restX[dot] - DOT_SPACING, y: field.restY[dot] })

    const moving = run(field, 4, null)

    expect(moving).toBe(false)
    expect(Math.abs(field.offX[dot])).toBeLessThan(0.05)
    expect(field.glow[dot]).toBe(0)
  })

  it('pushes dots outward as a ripple ring passes and drops the ripple after its lifetime', () => {
    const field = createDotField(880, 440)
    const origin = { x: 440, y: 220 }
    const dot = nearestDot(field, origin.x + 110, origin.y)
    const ripples: Ripple[] = [{ ...origin, age: 0 }]

    run(field, 0.25, null, ripples)

    expect(field.offX[dot]).toBeGreaterThan(1)

    run(field, 2, null, ripples)

    expect(ripples).toHaveLength(0)
  })
})
