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
  ChartNoAxesCombined,
  GitBranch,
  KeyRound,
  ScanLine,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { FeatureItem } from '../feature-item'

interface FeaturesProps {
  className?: string
}

export function Features(props: FeaturesProps) {
  const { t } = useTranslation()
  const features = [
    {
      title: t('One key, every connection'),
      description: t(
        'Switch models without juggling endpoints and credentials. Keep your application code simple.'
      ),
      icon: KeyRound,
      label: t('Unified API'),
    },
    {
      title: t('Know where every token goes'),
      description: t(
        'See your balance, usage and request details together. Understand your spend as you build.'
      ),
      icon: ChartNoAxesCombined,
      label: t('Usage & logs'),
    },
    {
      title: t('A smarter path for requests'),
      description: t(
        'Route across providers with retries, load balancing and fallback channels.'
      ),
      icon: GitBranch,
      label: t('Multi-provider'),
    },
    {
      title: t('Make the gateway your own'),
      description: t(
        'Open source at its core. Deploy on your own infrastructure and keep control of your data.'
      ),
      icon: ScanLine,
      label: t('Open source'),
    },
  ]

  return (
    <section className={cn('px-5 pb-20 md:px-8 md:pb-28', props.className)}>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end'>
          <div>
            <p className='pico-home-caption text-primary'>
              {t('Quietly capable')}
            </p>
            <h2 className='mt-4 text-[1.9rem] leading-[1.25] font-semibold tracking-[-0.035em] md:text-[2.5rem]'>
              {t('Less to manage. More to create.')}
            </h2>
          </div>
          <p className='text-muted-foreground max-w-sm text-sm leading-7'>
            {t(
              'The details between your idea and the model, taken care of in one place.'
            )}
          </p>
        </AnimateInView>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {features.map((feature, index) => (
            <AnimateInView
              key={feature.label}
              delay={index * 65}
              className='h-full'
            >
              <Card className='pico-home-feature h-full gap-0 rounded-2xl p-2'>
                <FeatureItem
                  title={feature.title}
                  description={feature.description}
                  icon={
                    <feature.icon aria-hidden className='text-primary size-5' />
                  }
                />
                <span className='text-muted-foreground mt-auto px-4 pt-3 pb-4 font-mono text-[9px] tracking-[0.12em] uppercase'>
                  {feature.label}
                </span>
              </Card>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
