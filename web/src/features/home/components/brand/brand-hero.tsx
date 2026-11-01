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

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { useBrandName } from '../../hooks'
import { SLOGAN_MODEL_SLOT } from '../../lib/brand-events'
import { BrandSlogan } from './brand-slogan'
import { DotField } from './dot-field'
import { PicoRouter } from './pico-router'

// Models the slogan cycles through. Only list models served from the
// provider's official API: the slogan promises it.
const SLOGAN_MODELS = ['Claude', 'GPT', 'Gemini', 'DeepSeek']
// The slogan writes itself in about a second; the rest of the hero follows.
const AFTER_SLOGAN_MS = 900

interface BrandHeroProps {
  isAuthenticated?: boolean
}

export function BrandHero(props: BrandHeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const brandName = useBrandName()
  const sloganTemplate = t("If it says {{model}}, it's {{model}}", {
    model: SLOGAN_MODEL_SLOT,
  })
  // Only link docs the operator configured; the upstream fallback points at
  // the gateway's own self-hosting docs, not at docs for API customers.
  const docsUrl =
    typeof status?.docs_link === 'string' ? status.docs_link.trim() : ''

  return (
    <DotField className='px-6 pt-28 pb-20 md:pt-36 md:pb-24'>
      <div className='mx-auto flex max-w-5xl flex-col items-center text-center'>
        <h1 className='font-serif [font-feature-settings:"halt"] text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.15] font-medium tracking-tight md:whitespace-nowrap'>
          <BrandSlogan
            key={sloganTemplate}
            template={sloganTemplate}
            models={SLOGAN_MODELS}
          />
        </h1>

        <p
          className='landing-animate-fade-up text-muted-foreground mt-7 max-w-xl text-base leading-relaxed text-balance md:text-lg'
          style={{ animationDelay: `${AFTER_SLOGAN_MS}ms` }}
        >
          {t(
            "{{name}} connects straight to each provider's official API, with no watered-down or swapped models. Every call's model is in your usage log.",
            { name: brandName }
          )}
        </p>

        <div
          className='landing-animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3'
          style={{ animationDelay: `${AFTER_SLOGAN_MS + 100}ms` }}
        >
          {props.isAuthenticated ? (
            <Button
              size='lg'
              className='group h-11 px-6'
              render={<Link to='/dashboard' />}
            >
              {t('Go to Dashboard')}
              <ArrowRight className='transition-transform group-hover:translate-x-0.5' />
            </Button>
          ) : (
            <Button
              size='lg'
              className='group h-11 px-6'
              render={<Link to='/sign-up' />}
            >
              {t('Get Started')}
              <ArrowRight className='transition-transform group-hover:translate-x-0.5' />
            </Button>
          )}
          <Button
            size='lg'
            variant='outline'
            className='bg-background/60 h-11 px-6'
            render={<Link to='/pricing' />}
          >
            {t('View Pricing')}
          </Button>
          {docsUrl && (
            <Button
              size='lg'
              variant='ghost'
              className='h-11 px-4'
              render={
                <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
              }
            >
              {t('Docs')}
            </Button>
          )}
        </div>
      </div>

      <div
        className='landing-animate-fade-up mt-20'
        style={{ animationDelay: `${AFTER_SLOGAN_MS + 250}ms` }}
      >
        <PicoRouter />
      </div>
    </DotField>
  )
}
