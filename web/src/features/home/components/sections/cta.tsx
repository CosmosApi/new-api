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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()
  if (props.isAuthenticated) return null

  return (
    <section className={cn('px-5 pb-20 md:px-8 md:pb-24', props.className)}>
      <AnimateInView
        animation='scale-in'
        className='pico-home-cta relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border px-7 py-12 md:px-14 md:py-16'
      >
        <div
          aria-hidden
          className='pico-home-cta-field pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 sm:block'
        />
        <div className='relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center'>
          <div className='max-w-xl'>
            <p className='pico-home-caption text-primary'>
              {t('Let your next idea bloom')}
            </p>
            <h2 className='mt-4 text-[2rem] leading-[1.2] font-semibold tracking-[-0.04em] md:text-[2.75rem]'>
              {t('Great things start with a connection.')}
            </h2>
            <p className='text-muted-foreground mt-4 max-w-md text-sm leading-7'>
              {t(
                'Choose your model. Connect your project. Make something that matters to you.'
              )}
            </p>
          </div>
          <div className='flex shrink-0 flex-col items-start gap-4'>
            <Button
              className='pico-home-primary h-12 rounded-full px-7 font-semibold'
              render={<Link to='/sign-up' />}
            >
              {t('Get started')}
              <ArrowRight aria-hidden className='size-4' />
            </Button>
            <Link
              to='/sign-in'
              className='text-muted-foreground decoration-border hover:text-foreground focus-visible:ring-primary text-sm underline underline-offset-4 focus-visible:rounded focus-visible:ring-2'
            >
              {t('Already have an account? Sign in')}
            </Link>
          </div>
        </div>
      </AnimateInView>
    </section>
  )
}
