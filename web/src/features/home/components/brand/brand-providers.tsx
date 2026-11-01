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

import { getLobeIcon } from '@/lib/lobe-icon'

// Mono icons keep the strip calm on the cream canvas; brand colors would
// compete with the single clay accent.
const PROVIDERS = [
  { icon: 'Claude', name: 'Claude' },
  { icon: 'OpenAI', name: 'OpenAI' },
  { icon: 'Gemini', name: 'Gemini' },
  { icon: 'DeepSeek', name: 'DeepSeek' },
  { icon: 'Qwen', name: 'Qwen' },
  { icon: 'Doubao', name: 'Doubao' },
  { icon: 'Kimi', name: 'Kimi' },
  { icon: 'Zhipu', name: 'GLM' },
  { icon: 'Minimax', name: 'MiniMax' },
  { icon: 'Grok', name: 'Grok' },
] as const

function ProviderList(props: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={props.hidden}
      className='text-muted-foreground flex shrink-0 items-center gap-12 pr-12'
    >
      {PROVIDERS.map((p) => (
        <li
          key={p.name}
          className='hover:text-foreground flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors'
        >
          <span aria-hidden className='flex size-5 items-center'>
            {getLobeIcon(p.icon, 20)}
          </span>
          {p.name}
        </li>
      ))}
    </ul>
  )
}

export function BrandProviders() {
  const { t } = useTranslation()

  return (
    <section className='border-y py-10'>
      <p className='text-muted-foreground px-6 text-center text-sm'>
        {t('Models from these providers, one key for all of them')}
      </p>
      {/* Two copies of the list scroll as one strip; the second is hidden
          from assistive tech. brand.css pauses it on hover and stops it
          under reduced motion. */}
      <div className='brand-marquee mt-6 overflow-hidden'>
        <div className='brand-marquee-track flex w-max'>
          <ProviderList />
          <ProviderList hidden />
        </div>
      </div>
    </section>
  )
}
