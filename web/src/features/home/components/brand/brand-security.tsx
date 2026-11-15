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
import { FileSearch, KeyRound, ShieldCheck, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

// Claims that the gateway can actually keep: every one maps to a field or a
// record in the product, not to a badge bought from an auditor.
const GUARDS = [
  {
    id: 'keys',
    icon: KeyRound,
    label: 'Keys',
    title: 'Scoped keys, instant revoke',
    desc: 'Give each key its own quota, expiry, model list and allowed IPs. Revoke it and the next request is refused.',
  },
  {
    id: 'records',
    icon: FileSearch,
    label: 'Records',
    title: 'The receipt, not the conversation',
    desc: 'Usage logs keep the model, tokens and cost of each call. Prompts and replies are forwarded to the provider, not stored.',
  },
  {
    id: 'billing',
    icon: Wallet,
    label: 'Billing',
    title: 'One wallet, one owner',
    desc: "Every key draws only from its own account's balance, so one team's usage never touches another's.",
  },
] as const

/**
 * A rubber-stamp seal beside the heading. Two rings, a line of type bent round
 * the top half, and the brand mark in the middle: the same ink-on-paper
 * vocabulary as the rest of the home page, without borrowing a certification
 * badge the product does not hold.
 */
function SecuritySeal() {
  return (
    <svg
      aria-hidden
      viewBox='0 0 120 120'
      className='text-primary/70 size-28 shrink-0 -rotate-[7deg]'
    >
      <defs>
        <path
          id='pico-seal-arc'
          d='M 14 60 A 46 46 0 0 1 106 60'
          fill='none'
        />
      </defs>
      <circle
        cx='60'
        cy='60'
        r='57'
        fill='none'
        stroke='currentColor'
        strokeWidth='1'
        opacity='0.5'
      />
      <circle
        cx='60'
        cy='60'
        r='44'
        fill='none'
        stroke='currentColor'
        strokeWidth='0.75'
        strokeDasharray='1 4'
        opacity='0.65'
      />
      <text className='fill-current font-mono text-[6px] tracking-[0.24em] uppercase'>
        <textPath href='#pico-seal-arc' startOffset='50%' textAnchor='middle'>
          Official API · on record
        </textPath>
      </text>
      <g transform='translate(60 57) scale(0.85)'>
        <circle
          r='13'
          fill='none'
          stroke='currentColor'
          strokeWidth='6'
        />
        <path
          d='M -13 0 V 20'
          stroke='currentColor'
          strokeWidth='6'
          strokeLinecap='round'
        />
        <circle r='5' className='fill-primary' />
      </g>
    </svg>
  )
}

export function BrandSecurity() {
  const { t } = useTranslation()

  return (
    <section className='px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-5xl'>
        <div className='flex items-end justify-between gap-10'>
          <AnimateInView className='max-w-2xl'>
            <p className='text-muted-foreground font-mono text-[10px] tracking-[0.28em] uppercase'>
              {t('Security')}
            </p>
            <h2 className='mt-4 font-serif text-3xl leading-tight font-medium tracking-tight text-balance md:text-4xl'>
              {t('Guardrails you can check for yourself')}
            </h2>
            <p className='text-muted-foreground mt-4 text-sm leading-relaxed md:text-base'>
              {t(
                'Nothing here asks for blind trust. Every key, call and charge leaves a record you can read.'
              )}
            </p>
          </AnimateInView>
          <AnimateInView delay={120} className='hidden md:block'>
            <SecuritySeal />
          </AnimateInView>
        </div>

        <AnimateInView delay={100} className='mt-14'>
          <div className='brand-card border-border/60 overflow-hidden rounded-2xl border'>
            <div className='divide-border/60 grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0'>
              {GUARDS.map((guard) => (
                <div
                  key={guard.id}
                  className='flex h-full flex-col gap-5 p-7 md:p-8'
                >
                  <div className='flex items-center gap-3'>
                    <span className='bg-background text-primary flex size-9 items-center justify-center rounded-lg border'>
                      <guard.icon
                        aria-hidden
                        className='size-4'
                        strokeWidth={1.75}
                      />
                    </span>
                    <span className='text-muted-foreground font-mono text-[10px] tracking-[0.25em] uppercase'>
                      {t(guard.label)}
                    </span>
                  </div>
                  <div>
                    <h3 className='font-serif text-lg font-medium tracking-tight'>
                      {t(guard.title)}
                    </h3>
                    <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                      {t(guard.desc)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className='border-border/60 flex items-center gap-3 border-t px-6 py-5 md:px-8'>
              <ShieldCheck
                aria-hidden
                className='text-primary size-4 shrink-0'
                strokeWidth={1.75}
              />
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {t('Official APIs only — no reseller keys, no swapped models.')}
              </p>
            </div>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
