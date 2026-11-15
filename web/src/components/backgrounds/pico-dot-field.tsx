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
import { useTheme } from '@/context/theme-provider'

import { DotGrid } from './dot-grid'

/**
 * The site-wide dot matrix. A fixed field behind public content; the cursor
 * pushes it out of the way and clicks send a ripple through the grid.
 * Colors follow the palette instead of the component defaults.
 */
export function PicoDotField() {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  return (
    <div aria-hidden className='pico-dot-field'>
      <DotGrid
        dotSize={2.4}
        gap={22}
        baseColor={dark ? '#F2EFE9' : '#141413'}
        activeColor={dark ? '#FF9A5C' : '#F8762B'}
        opacity={dark ? 0.24 : 0.22}
        glow={0.7}
        proximity={150}
        strength={1}
        bounce={0.6}
        tension={0.4}
        returnDuration={0.8}
        shockRadius={320}
        shockStrength={5}
        swell={0.8}
        stretch={0.35}
        intro
      />
    </div>
  )
}
