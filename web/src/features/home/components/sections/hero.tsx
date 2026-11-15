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
import { ArrowDown, ArrowRight, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'
import { cn } from '@/lib/utils'

import { SignalField } from '../signal-field'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl = (status?.docs_link as string | undefined)?.trim() || ''

  return (
    <section
      className={cn(
        'pico-home-hero relative overflow-hidden px-5 pt-28 pb-14 md:px-8 md:pt-36 md:pb-20',
        props.className
      )}
    >
      <div aria-hidden className='pico-home-atmosphere' />
      <div className='relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-12'>
        <div className='landing-animate-fade-up flex flex-col items-start'>
          <div className='pico-home-eyebrow inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
            <span className='pico-home-status-dot size-1.5 rounded-full' />
            <span className='font-mono text-[10px] tracking-[0.14em]'>
              PicoAPI · {t('Your models, connected')}
            </span>
          </div>
          <h1 className='mt-7 text-[clamp(2.7rem,5.3vw,4.5rem)] leading-[1.15] font-semibold tracking-[-0.05em]'>
            {t('One')}{' '}
            <span className='pico-home-key font-serif font-medium italic'>
              Key
            </span>
            {t(',')}
            <br />
            {t('Every model within reach.')}
          </h1>
          <p className='text-muted-foreground mt-6 max-w-[29rem] text-[15px] leading-[1.9]'>
            {t(
              'One endpoint for OpenAI, Claude, Gemini and DeepSeek. Keep your code familiar, and your usage, balance and logs together.'
            )}
          </p>
          <div className='mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3'>
            <Button
              className='pico-home-primary h-12 rounded-full px-5 font-semibold sm:px-6'
              render={
                <Link to={props.isAuthenticated ? '/dashboard' : '/sign-up'} />
              }
            >
              {props.isAuthenticated ? t('Enter Console') : t('Get started')}
              <ArrowRight aria-hidden className='size-4' />
            </Button>
            <Button
              variant='outline'
              className='bg-background/70 h-12 rounded-full px-5 sm:px-6'
              render={<Link to='/pricing' />}
            >
              {t('Explore model pricing')}
            </Button>
            {docsUrl &&
              (docsUrl.startsWith('http') ? (
                <Button
                  variant='ghost'
                  className='text-muted-foreground h-11 rounded-full px-2 sm:px-3'
                  render={
                    <a
                      href={docsUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    />
                  }
                >
                  <BookOpen aria-hidden className='size-4' />
                  {t('Docs')}
                </Button>
              ) : (
                <Button
                  variant='ghost'
                  className='text-muted-foreground h-11 rounded-full px-2 sm:px-3'
                  render={<Link to={docsUrl} />}
                >
                  <BookOpen aria-hidden className='size-4' />
                  {t('Docs')}
                </Button>
              ))}
          </div>
          <div className='border-border/70 mt-10 flex w-full max-w-[29rem] flex-col items-start gap-2 border-t pt-5 sm:flex-row sm:items-center sm:gap-4'>
            <span className='pico-home-caption shrink-0'>
              {t('Works with')}
            </span>
            <div className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-xs'>
              {['Cherry Studio', 'CC Switch', 'NextChat', 'LobeChat'].map(
                (name) => (
                  <span key={name}>{name}</span>
                )
              )}
            </div>
          </div>
        </div>
        <div className='landing-animate-scale-in min-w-0'>
          <SignalField />
        </div>
      </div>
      <div className='text-muted-foreground/80 relative mx-auto mt-12 flex max-w-6xl items-center gap-3 lg:mt-16'>
        <span aria-hidden className='bg-border h-px w-8' />
        <span className='font-mono text-[10px] tracking-wider'>
          {t('Less wiring. More building.')}
        </span>
        <ArrowDown aria-hidden className='size-3' />
      </div>
    </section>
  )
}
