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
import type { PointerEvent, ReactNode } from 'react'

import { cn } from '@/lib/utils'

// Writes the pointer position into CSS variables that brand.css reads, so
// the spotlight follows the cursor without re-rendering React.
function trackPointer(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
  el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
}

interface SpotlightCardProps {
  className?: string
  children: ReactNode
}

/** Card with a soft clay glow that follows the pointer on hover. */
export function SpotlightCard(props: SpotlightCardProps) {
  return (
    <div
      onPointerMove={trackPointer}
      className={cn(
        'group/spot bg-card relative overflow-hidden rounded-2xl border transition-colors hover:border-primary/40',
        props.className
      )}
    >
      <div
        aria-hidden
        className='brand-spotlight pointer-events-none absolute inset-0'
      />
      <div className='relative h-full'>{props.children}</div>
    </div>
  )
}

interface PicoMarkProps {
  className?: string
}

/**
 * Brand mark: a lowercase "p" whose bowl holds the clay dot. Same geometry
 * as public/brand/picoapi-mark.svg; the ink follows the text colour so it
 * works in both themes. Size it by height, the width follows.
 */
export function PicoMark(props: PicoMarkProps) {
  return (
    <svg
      aria-hidden
      viewBox='-16 -16 32 39'
      className={cn('h-8 w-auto', props.className)}
    >
      <circle r='13' fill='none' stroke='currentColor' strokeWidth='6' />
      <path
        d='M -13 0 V 20'
        stroke='currentColor'
        strokeWidth='6'
        strokeLinecap='round'
      />
      <circle r='5' className='fill-primary' />
    </svg>
  )
}
