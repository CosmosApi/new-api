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
import { KeyRound, ReceiptText, ScrollText, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

import { KeysDemo, LogsDemo, MeterDemo, ToolsDemo } from './feature-demos'
import { SpotlightCard } from './primitives'

export function BrandFeatures() {
  const { t } = useTranslation()

  // Bento layout on md+: wide, narrow / narrow, wide.
  const features = [
    {
      id: 'tools',
      icon: Wrench,
      span: 'md:col-span-2',
      title: t('Works with the tools you use'),
      desc: t(
        'Claude Code, Codex, Cursor, Cherry Studio, Dify and any OpenAI-compatible client.'
      ),
      demo: <ToolsDemo />,
    },
    {
      id: 'keys',
      icon: KeyRound,
      span: '',
      title: t('Keys under your control'),
      desc: t(
        'Set a quota, expiry and allowed models for each key, and revoke it any time.'
      ),
      demo: <KeysDemo />,
    },
    {
      id: 'logs',
      icon: ScrollText,
      span: '',
      title: t('Every call on record'),
      desc: t(
        'Usage logs show the model, tokens and cost of each request, so every charge can be checked.'
      ),
      demo: <LogsDemo />,
    },
    {
      id: 'billing',
      icon: ReceiptText,
      span: 'md:col-span-2',
      title: t('Pay only for what you use'),
      desc: t(
        'Top up any amount. Calls are billed at the prices on the public price list.'
      ),
      demo: <MeterDemo />,
    },
  ]

  return (
    <section className='px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView className='max-w-xl'>
          <h2 className='font-serif text-3xl leading-tight font-medium tracking-tight text-balance md:text-4xl'>
            {t('Built for teams that ship with AI every day')}
          </h2>
        </AnimateInView>

        <div className='mt-14 grid gap-4 md:grid-cols-3'>
          {features.map((f, i) => (
            <AnimateInView key={f.id} delay={i * 80} className={f.span}>
              <SpotlightCard className='h-full'>
                <div className='flex h-full flex-col gap-6 p-7 md:p-8'>
                  <div>
                    <div className='bg-background text-primary flex size-10 items-center justify-center rounded-xl border'>
                      <f.icon
                        aria-hidden
                        className='size-5'
                        strokeWidth={1.75}
                      />
                    </div>
                    <h3 className='mt-6 font-serif text-xl font-medium tracking-tight'>
                      {f.title}
                    </h3>
                    <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                      {f.desc}
                    </p>
                  </div>
                  <div className='mt-auto'>{f.demo}</div>
                </div>
              </SpotlightCard>
            </AnimateInView>
          ))}
        </div>
        <p className='text-muted-foreground mt-4 text-xs'>
          {t('Card previews use example data.')}
        </p>
      </div>
    </section>
  )
}
