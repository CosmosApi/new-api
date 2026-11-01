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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { PicoDotField } from '@/components/backgrounds/pico-dot-field'
import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  const brand = (
    <>
      <div className='relative h-9 w-9 shrink-0'>
        {loading ? (
          <Skeleton className='absolute inset-0 rounded-full' />
        ) : (
          <img
            src={logo}
            alt={t('Logo')}
            className='h-9 w-9 rounded-full object-cover'
          />
        )}
      </div>
      {loading ? (
        <Skeleton className='h-6 w-24' />
      ) : (
        <span className='font-serif text-xl font-medium tracking-tight'>
          {systemName}
        </span>
      )}
    </>
  )

  return (
    <div className='pico-auth relative min-h-svh overflow-hidden'>
      <PicoDotField />
      <div className='relative z-10 mx-auto grid min-h-svh w-full max-w-[1240px] lg:grid-cols-[1.02fr_0.98fr]'>
        <aside className='pico-auth-panel hidden flex-col justify-between gap-12 px-12 py-12 lg:flex xl:px-16'>
          <Link
            to='/'
            className='flex w-fit items-center gap-3 transition-opacity hover:opacity-80'
          >
            {brand}
          </Link>

          <div className='max-w-[30rem]'>
            <p className='text-primary font-mono text-[10px] tracking-[0.1em]'>
              {t('Less wiring. More building.')}
            </p>
            <h2 className='mt-5 text-[2.6rem] leading-[1.2] font-medium tracking-[-0.04em]'>
              {t('One')}{' '}
              <span className='font-serif text-primary italic'>{t('Key')}</span>
              {t(',')}
              <br />
              {t('Every model within reach.')}
            </h2>
            <p className='text-muted-foreground mt-6 max-w-sm text-sm leading-7'>
              {t(
                'One endpoint for OpenAI, Claude, Gemini and DeepSeek. Keep your code familiar, and your usage, balance and logs together.'
              )}
            </p>

            <div
              aria-hidden
              className='relative mt-10 flex size-[15rem] items-center justify-center'
            >
              <div className='pico-auth-disc absolute inset-0 rounded-full' />
              <div className='pico-auth-ring absolute inset-[18%] rounded-full border border-dashed' />
              <span className='pico-auth-core relative size-3 rounded-full' />
            </div>

            <div className='mt-10 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] tracking-wider text-muted-foreground'>
              {['OpenAI', 'Claude', 'Gemini', 'DeepSeek'].map((provider) => (
                <span key={provider} className='flex items-center gap-1.5'>
                  <span
                    aria-hidden
                    className='bg-primary/60 size-1 rounded-full'
                  />
                  {provider}
                </span>
              ))}
            </div>
          </div>

          <p className='text-muted-foreground/70 font-mono text-[10px] tracking-wider'>
            {t('One API. Many possibilities.')}
          </p>
        </aside>

        <div className='relative flex items-start justify-center px-4 pt-28 pb-12 sm:px-8 lg:items-center lg:py-20 lg:px-10'>
          <Link
            to='/'
            className='absolute top-6 left-4 flex items-center gap-2 transition-opacity hover:opacity-80 sm:left-6 lg:hidden'
          >
            {brand}
          </Link>
          <div className='pico-auth-card w-full max-w-[480px] sm:rounded-[1.5rem] sm:border sm:border-border/60 sm:bg-card/70 sm:p-8 sm:backdrop-blur-sm'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
