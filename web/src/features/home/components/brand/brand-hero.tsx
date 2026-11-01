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
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { useBrandName } from '../../hooks'
import { SLOGAN_MODEL_SLOT } from '../../lib/brand-events'
import { BrandSlogan } from './brand-slogan'
import { GlimmerField } from './glimmer-field'
import { PicoRouter } from './pico-router'
import { PicoMark } from './primitives'

// Models the slogan cycles through. Only list models served from the
// provider's official API: the slogan promises it.
const SLOGAN_MODELS = ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM', 'Kimi']
// Sequence: the field arrives out of warp, the wordmark is projected in as
// it slows, then the slogan writes itself and the rest of the hero follows.
const PROJECT_MS = 900
const SLOGAN_DELAY_MS = 1700
const AFTER_SLOGAN_MS = SLOGAN_DELAY_MS + 1000

// Twinkles that catch on the wordmark once it has landed.
const SPARKS = [
  { left: '8%', top: '12%', size: 14, delay: '0s' },
  { left: '61%', top: '4%', size: 10, delay: '1.1s' },
  { left: '94%', top: '70%', size: 12, delay: '2.2s' },
]

interface ProjectedWordmarkProps {
  name: string
}

/** The brand projected into the middle of the starfield. */
function ProjectedWordmark(props: ProjectedWordmarkProps) {
  // The sheen clips its gradient to text, so only the name sits inside it;
  // the mark keeps a solid stroke.
  const word = (sheen: boolean) => (
    <span className='flex items-center gap-[0.18em]'>
      <PicoMark className='h-[0.92em] shrink-0' />
      <span className={sheen ? 'brand-sheen' : undefined}>{props.name}</span>
    </span>
  )
  return (
    <div
      data-sky-anchor=''
      aria-hidden
      className='relative font-serif text-[clamp(3.25rem,10vw,7.5rem)] leading-none font-medium tracking-[-0.02em] select-none'
      style={{ '--project-delay': `${PROJECT_MS}ms` } as CSSProperties}
    >
      <span className='brand-flare pointer-events-none absolute top-1/2 left-1/2 size-[3.2em] -translate-x-1/2 -translate-y-1/2' />
      <span className='brand-ghost brand-ghost-a pointer-events-none absolute inset-0 text-[#ff6a3d]'>
        {word(false)}
      </span>
      <span className='brand-ghost brand-ghost-b pointer-events-none absolute inset-0 text-[#4d7cff]'>
        {word(false)}
      </span>
      <span className='brand-project relative block'>{word(true)}</span>
      {SPARKS.map((s) => (
        <span
          key={s.left}
          className='brand-spark pointer-events-none absolute'
          style={
            {
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              '--spark-delay': s.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

interface BrandHeroProps {
  isAuthenticated?: boolean
}

export function BrandHero(props: BrandHeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const brandName = useBrandName()
  const sloganTemplate = t('Imagine without limits, in {{model}}', {
    model: SLOGAN_MODEL_SLOT,
  })
  // Only link docs the operator configured; the upstream fallback points at
  // the gateway's own self-hosting docs, not at docs for API customers.
  const docsUrl =
    typeof status?.docs_link === 'string' ? status.docs_link.trim() : ''

  return (
    <section className='relative pb-20 md:pb-24'>
      {/* Starfield zone: the page dots stop here and fade back in below. */}
      <div className='relative isolate'>
        <div
          aria-hidden
          className='brand-sky-zone bg-background pointer-events-none absolute inset-0 -z-10'
        >
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_38%,color-mix(in_oklch,var(--primary)_9%,transparent),transparent_72%)]' />
          <GlimmerField
            anchor='[data-sky-anchor]'
            arriveMs={PROJECT_MS}
            className='absolute inset-0'
          />
        </div>

        <div className='relative mx-auto flex min-h-[92svh] max-w-5xl flex-col items-center justify-center px-6 pt-24 pb-28 text-center'>
          <ProjectedWordmark name={brandName} />

          <h1
            className='landing-animate-fade-in mt-8 font-serif [font-feature-settings:"halt"] text-[clamp(2.25rem,5.2vw,4rem)] leading-[1.15] font-medium tracking-tight md:mt-10 md:whitespace-nowrap'
            style={{ animationDelay: `${SLOGAN_DELAY_MS - 200}ms` }}
          >
            <BrandSlogan
              key={sloganTemplate}
              template={sloganTemplate}
              models={SLOGAN_MODELS}
              delay={SLOGAN_DELAY_MS}
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
      </div>

      {/* Below the starfield the page dots show through again. */}
      <div
        className='landing-animate-fade-up relative mt-4 px-6'
        style={{ animationDelay: `${AFTER_SLOGAN_MS}ms` }}
      >
        <PicoRouter />
      </div>
    </section>
  )
}
