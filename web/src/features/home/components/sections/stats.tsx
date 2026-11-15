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
import { AudioLines, Image, MessageSquare, TerminalSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

interface StatsProps {
  className?: string
}

export function Stats(props: StatsProps) {
  const { t } = useTranslation()
  const capabilities = [
    { icon: MessageSquare, label: t('Chat & reasoning') },
    { icon: Image, label: t('Image generation') },
    { icon: AudioLines, label: t('Audio & speech') },
    { icon: TerminalSquare, label: t('Your favorite SDKs') },
  ]

  return (
    <section
      aria-label={t('Build with PicoAPI')}
      className={cn(
        'pico-home-capabilities border-y border-border/70 px-5 md:px-8',
        props.className
      )}
    >
      <div className='mx-auto flex max-w-6xl flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between md:gap-8'>
        <span className='pico-home-caption shrink-0'>
          {t('Many possibilities. One connection.')}
        </span>
        <div className='grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-8'>
          {capabilities.map((capability) => (
            <span
              key={capability.label}
              className='text-foreground/80 flex items-center gap-2 text-xs font-medium'
            >
              <capability.icon
                aria-hidden
                className='text-muted-foreground size-4'
              />
              {capability.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
