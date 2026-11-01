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
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { cn } from '@/lib/utils'

export function BrandSteps() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const listRef = useRef<HTMLOListElement>(null)
  // The line fills as the list scrolls through the viewport; each step's dot
  // lights up once the line reaches it.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 85%', 'end 55%'],
  })
  const [reached, setReached] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setReached(p >= 0.98 ? 3 : Math.floor(p * 3) + (p > 0.02 ? 1 : 0))
  })

  const steps = [
    {
      num: '01',
      title: t('Create an account'),
      desc: t('Sign up with your email and top up your balance.'),
    },
    {
      num: '02',
      title: t('Create an API key'),
      desc: t('Generate a key in the console and set its quota if needed.'),
    },
    {
      num: '03',
      title: t('Change the base URL'),
      desc: t('Point your SDK or tool at our address. No other code changes.'),
    },
  ]
  const lit = reduceMotion ? steps.length : reached

  return (
    <section className='bg-muted/40 border-y px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView>
          <h2 className='font-serif text-3xl leading-tight font-medium tracking-tight md:text-4xl'>
            {t('Up and running in three steps')}
          </h2>
        </AnimateInView>

        <div className='relative mt-14'>
          <div
            aria-hidden
            className='bg-border absolute inset-x-0 top-[5px] hidden h-px md:block'
          >
            <motion.div
              className='bg-primary h-full origin-left'
              style={{ scaleX: reduceMotion ? 1 : scrollYProgress }}
            />
          </div>
          <ol ref={listRef} className='grid gap-10 md:grid-cols-3 md:gap-8'>
            {steps.map((step, i) => (
              <li key={step.num} className='relative pt-8'>
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-0 left-0 size-[11px] rounded-full border-2 transition-colors duration-300',
                    i < lit
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background'
                  )}
                />
                <span className='text-muted-foreground font-mono text-sm'>
                  {step.num}
                </span>
                <h3 className='mt-3 text-lg font-semibold'>{step.title}</h3>
                <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
