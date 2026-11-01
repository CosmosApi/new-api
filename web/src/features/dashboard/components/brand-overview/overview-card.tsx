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
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface OverviewCardProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/**
 * Section frame for the PicoAPI overview: one hairline border, serif title,
 * no nested card backgrounds.
 */
export function OverviewCard(props: OverviewCardProps) {
  return (
    <section
      className={cn(
        'bg-card flex flex-col rounded-2xl border',
        props.className
      )}
    >
      {(props.title || props.actions) && (
        <header className='flex flex-wrap items-start justify-between gap-3 px-5 pt-5'>
          <div className='min-w-0'>
            {props.title && (
              <h3 className='font-serif text-lg font-medium tracking-tight'>
                {props.title}
              </h3>
            )}
            {props.description && (
              <p className='text-muted-foreground mt-0.5 text-xs'>
                {props.description}
              </p>
            )}
          </div>
          {props.actions && (
            <div className='flex shrink-0 items-center gap-2'>
              {props.actions}
            </div>
          )}
        </header>
      )}
      <div className={cn('flex-1 p-5', props.bodyClassName)}>
        {props.children}
      </div>
    </section>
  )
}
