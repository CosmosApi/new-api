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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'

import { GalaxyField } from './galaxy-field'
import { PicoMark } from './primitives'

interface BrandCTAProps {
  isAuthenticated?: boolean
}

export function BrandCTA(props: BrandCTAProps) {
  const { t } = useTranslation()
  const [pulse, setPulse] = useState(0)

  if (props.isAuthenticated) {
    return null
  }

  return (
    <section className='px-6 py-24 md:py-32'>
      {/* Two faces of the same disc. Dark keeps the deep-space card; light
          prints it as a star chart — paper, ink, one warm spark — because a
          near-black block on a cream page reads as a hole, not a night sky. */}
      <AnimateInView
        animation='scale-in'
        className='relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#e3d9c6] bg-[linear-gradient(168deg,#fdf9f0_0%,#f7f1e4_52%,#f2eadb_100%)] text-[#141a30] shadow-[0_30px_70px_-45px_rgba(20,26,48,0.45)] dark:border-white/10 dark:bg-[#0b0d17] dark:bg-none dark:text-[#f4efe6] dark:shadow-[0_40px_90px_-40px_rgba(11,13,23,0.75)]'
      >
        {/* The galaxy listens on this wrapper, so the whole card is live. */}
        <div className='relative px-8 py-20 text-center md:px-16 md:py-28'>
          <GalaxyField pulse={pulse} className='absolute inset-0' />
          {/* Both themes clear a well behind the copy: ink in the dark, paper
              in the light. Without it the disc runs straight through the
              headline and the buttons. */}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_42%_38%_at_50%_44%,rgba(252,247,236,0.94)_0%,rgba(252,247,236,0.82)_45%,rgba(252,247,236,0)_78%)] dark:bg-[radial-gradient(ellipse_45%_35%_at_50%_42%,rgba(11,13,23,0.72)_0%,rgba(11,13,23,0.45)_48%,rgba(11,13,23,0)_78%)]'
          />
          <div className='relative'>
            <PicoMark className='mx-auto h-11 text-[#141a30] dark:text-[#f4efe6]' />
            <h2 className='mt-6 font-serif text-3xl leading-tight font-medium tracking-tight text-balance md:text-5xl'>
              {t('Make your first call in five minutes')}
            </h2>
            <p className='mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#141a30]/70 md:text-base dark:text-[#f4efe6]/75 dark:[text-shadow:0_1px_12px_rgba(11,13,23,0.9)]'>
              {t('Sign up, top up, and use any model with a single key.')}
            </p>
            <div className='mt-9 flex flex-wrap items-center justify-center gap-3'>
              <Button
                size='lg'
                className='group h-11 px-6'
                render={<Link to='/sign-up' />}
                onPointerEnter={() => setPulse((p) => p + 1)}
              >
                {t('Get Started')}
                <ArrowRight className='transition-transform group-hover:translate-x-0.5' />
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='h-11 px-6'
                render={<Link to='/pricing' />}
              >
                {t('View Pricing')}
              </Button>
            </div>
            <p className='mt-8 font-mono text-[10px] tracking-[0.25em] text-[#141a30]/55 uppercase dark:text-[#f4efe6]/50'>
              {t('Click anywhere in the galaxy')}
            </p>
          </div>
        </div>
      </AnimateInView>
    </section>
  )
}
