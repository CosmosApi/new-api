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
import { useId } from 'react'

import { cn } from '@/lib/utils'

interface PicoMarkProps {
  className?: string
  /** Retained for callers that paint an active route. The mark itself has a single focal dot. */
  activePetal?: number | null
  /** Pulses the focal dot when the mark mounts. */
  animated?: boolean
  title?: string
}

/**
 * The PicoAPI mark: a lowercase p whose counter holds one orange dot.
 * The dot is the whole idea — one point that reaches every model.
 */
export function PicoMark(props: PicoMarkProps) {
  const { className, animated = true, title = 'PicoAPI' } = props
  const rawId = useId()
  const dotId = `pico-mark-dot-${rawId.replaceAll(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <svg
      viewBox='0 0 120 120'
      role='img'
      aria-label={title}
      className={cn('block', className)}
    >
      <defs>
        <radialGradient id={dotId} cx='38%' cy='32%' r='72%'>
          <stop offset='0%' stopColor='#E98A66' />
          <stop offset='100%' stopColor='#D97757' />
        </radialGradient>
      </defs>

      <circle cx='60' cy='60' r='59' fill='#F0EEE6' />
      <circle
        cx='60'
        cy='60'
        r='57.5'
        fill='none'
        stroke='#141413'
        strokeOpacity='0.08'
        strokeWidth='1'
      />

      <path
        d='M30 52V98'
        fill='none'
        stroke='#141413'
        strokeWidth='16.5'
        strokeLinecap='round'
      />
      <circle
        cx='60'
        cy='52'
        r='30'
        fill='none'
        stroke='#141413'
        strokeWidth='16.5'
      />
      <circle
        cx='60'
        cy='52'
        r='11'
        fill={`url(#${dotId})`}
        className={cn(animated && 'pico-mark-dot')}
      />
    </svg>
  )
}
