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

import { DotField } from './dot-field'
import { PicoMark } from './primitives'

interface BrandCTAProps {
  isAuthenticated?: boolean
}

export function BrandCTA(props: BrandCTAProps) {
  const { t } = useTranslation()

  if (props.isAuthenticated) {
    return null
  }

  return (
    <DotField className='px-6 py-24 md:py-32'>
      <AnimateInView
        animation='scale-in'
        className='bg-card/80 mx-auto max-w-4xl rounded-3xl border px-8 py-14 text-center backdrop-blur-sm md:px-16 md:py-20'
      >
        <PicoMark className='mx-auto h-11' />
        <h2 className='mt-6 font-serif text-3xl leading-tight font-medium tracking-tight text-balance md:text-4xl'>
          {t('Make your first call in five minutes')}
        </h2>
        <p className='text-muted-foreground mx-auto mt-4 max-w-md text-sm leading-relaxed md:text-base'>
          {t('Sign up, top up, and use any model with a single key.')}
        </p>
        <div className='mt-9 flex flex-wrap items-center justify-center gap-3'>
          <Button
            size='lg'
            className='group h-11 px-6'
            render={<Link to='/sign-up' />}
          >
            {t('Get Started')}
            <ArrowRight className='transition-transform group-hover:translate-x-0.5' />
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='bg-background/60 h-11 px-6'
            render={<Link to='/pricing' />}
          >
            {t('View Pricing')}
          </Button>
        </div>
      </AnimateInView>
    </DotField>
  )
}
