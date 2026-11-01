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
import { afterEach, describe, expect, it } from 'vitest'

import { BRAND_CHART_PALETTE } from '../brand-chart-palette'
import { getDashboardChartColors } from '../charts'

const PRESET_KEY = 'newapi:theme:v1:preset'

afterEach(() => {
  localStorage.clear()
})

describe('dashboard chart colors', () => {
  it('uses the brand palette, led by clay, when no preset is stored', () => {
    const colors = getDashboardChartColors(3)

    expect(colors).toEqual([...BRAND_CHART_PALETTE])
    expect(colors[0]).toBe('#d97757')
  })

  it('keeps the chart library colors for another stored preset', () => {
    localStorage.setItem(PRESET_KEY, 'ocean-breeze')

    const colors = getDashboardChartColors(3)

    expect(colors.length).toBeGreaterThan(0)
    expect(colors).not.toContain('#d97757')
  })

  it('keeps the chart library colors for the base default preset', () => {
    localStorage.setItem(PRESET_KEY, 'default')

    expect(getDashboardChartColors(3)).not.toContain('#d97757')
  })
})
