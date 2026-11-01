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
import {
  DEFAULT_THEME_CUSTOMIZATION,
  THEME_PRESET_VALUES,
} from '@/lib/theme-customization'
import { readThemePreference, THEME_STORAGE_KEYS } from '@/lib/theme-storage'

/**
 * PicoAPI chart palette for the Anthropic preset: clay leads, followed by
 * the preset's muted warm accents. Every swatch sits at mid lightness so it
 * reads on both the cream canvas and the dark theme, which means a theme
 * switch never leaves stale chart colours behind.
 */
export const BRAND_CHART_PALETTE = [
  '#d97757', // clay
  '#8a8478', // warm grey
  '#6a9bcc', // sky
  '#788c5d', // olive
  '#c99a3c', // kraft
  '#b0717f', // fig
  '#a8573b', // deep clay
  '#7fa8a3', // cactus
] as const

/**
 * The palette for the active theme preset, or null for presets that keep the
 * chart library's default colours. Reads the stored preference, not the
 * <body> attribute, so it is right even before the theme provider's effects
 * have run.
 */
export function getBrandChartPalette(): readonly string[] | null {
  const preset = readThemePreference(
    THEME_STORAGE_KEYS.preset,
    THEME_PRESET_VALUES,
    DEFAULT_THEME_CUSTOMIZATION.preset
  )
  return preset === 'anthropic' ? BRAND_CHART_PALETTE : null
}
