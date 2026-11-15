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
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

export function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    {
      title: t('Create your account'),
      description: t('Sign up and open your PicoAPI console.'),
    },
    {
      title: t('Create an API key'),
      description: t('Choose the models and quota your project needs.'),
    },
    {
      title: t('Send your first request'),
      description: t(
        'Add your key and base URL to a compatible SDK or client.'
      ),
    },
  ]

  return (
    <section className='px-5 pb-20 md:px-8 md:pb-28'>
      <div className='border-border/70 mx-auto max-w-6xl border-t pt-10'>
        <AnimateInView className='flex flex-col justify-between gap-3 sm:flex-row sm:items-end'>
          <div>
            <p className='pico-home-caption text-primary'>
              {t('From idea to request')}
            </p>
            <h2 className='mt-4 text-2xl font-semibold tracking-tight'>
              {t('A small setup. A wide open canvas.')}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm'>
            {t('Three steps to your first connection.')}
          </p>
        </AnimateInView>
        <ol className='pico-home-steps relative mt-10 grid gap-8 md:grid-cols-3 md:gap-10'>
          {steps.map((step, index) => (
            <AnimateInView
              key={step.title}
              as='li'
              delay={index * 80}
              className='relative flex gap-4 md:flex-col md:gap-5'
            >
              <span className='pico-home-step relative z-1 flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-xs'>
                0{index + 1}
              </span>
              <div>
                <h3 className='text-sm font-semibold'>{step.title}</h3>
                <p className='text-muted-foreground mt-2 max-w-[17rem] text-sm leading-6'>
                  {step.description}
                </p>
              </div>
            </AnimateInView>
          ))}
        </ol>
      </div>
    </section>
  )
}
