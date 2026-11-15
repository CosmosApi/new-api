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
import { ArrowUpRight, Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStatus } from '@/hooks/use-status'

export function Integration() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const [language, setLanguage] = useState('curl')
  const docsUrl = (status?.docs_link as string | undefined)?.trim() || ''
  const serverAddress =
    (typeof status?.server_address === 'string' &&
      status.server_address.trim()) ||
    window.location.origin
  const serverRoot = serverAddress.replace(/\/+$/, '')
  const baseUrl = serverRoot.endsWith('/v1') ? serverRoot : `${serverRoot}/v1`
  const examples = [
    {
      id: 'curl',
      label: 'cURL',
      file: 'request.sh',
      code: `curl ${baseUrl}/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "Hello, Pico!" }
    ]
  }'`,
    },
    {
      id: 'python',
      label: 'Python',
      file: 'hello.py',
      code: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url=${JSON.stringify(baseUrl)},
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello, Pico!"}],
)
print(response.choices[0].message.content)`,
    },
    {
      id: 'javascript',
      label: 'JavaScript',
      file: 'hello.mjs',
      code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: ${JSON.stringify(baseUrl)},
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello, Pico!" }],
});
console.log(response.choices[0].message.content);`,
    },
  ]

  return (
    <section id='integration' className='px-5 py-20 md:px-8 md:py-28'>
      <div className='mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16'>
        <div>
          <p className='pico-home-caption text-primary'>
            {t('Built for your workflow')}
          </p>
          <h2 className='mt-5 text-[1.9rem] leading-[1.25] font-semibold tracking-[-0.035em] md:text-[2.5rem]'>
            {t('Change the endpoint.')}
            <br />
            <span className='text-primary'>{t('Keep the good parts.')}</span>
          </h2>
          <p className='text-muted-foreground mt-5 max-w-md text-[15px] leading-[1.9]'>
            {t(
              'Use the SDKs and tools you already know. Connect your API key, choose a model, and send your first request.'
            )}
          </p>
          <ul className='mt-7 space-y-4'>
            {[
              t('Compatible with the OpenAI SDK'),
              t('Manage models and quotas together'),
              t('Trace every request in your console'),
            ].map((point) => (
              <li key={point} className='flex items-center gap-3 text-sm'>
                <span className='pico-home-check flex size-5 items-center justify-center rounded-full'>
                  <Check aria-hidden className='size-3' />
                </span>
                {point}
              </li>
            ))}
          </ul>
          {docsUrl &&
            (docsUrl.startsWith('http') ? (
              <a
                href={docsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='pico-home-doc-link mt-8 inline-flex items-center gap-1.5 text-sm font-medium'
              >
                {t('Read the integration guide')}
                <ArrowUpRight aria-hidden className='size-4' />
              </a>
            ) : (
              <Link
                to={docsUrl}
                className='pico-home-doc-link mt-8 inline-flex items-center gap-1.5 text-sm font-medium'
              >
                {t('Read the integration guide')}
                <ArrowUpRight aria-hidden className='size-4' />
              </Link>
            ))}
        </div>
        <Tabs
          value={language}
          onValueChange={(value) => setLanguage(String(value))}
          className='pico-code-window min-w-0 gap-0 overflow-hidden rounded-2xl border'
        >
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 pt-4 pb-3 sm:px-5'>
            <TabsList
              variant='line'
              aria-label={t('Code language')}
              className='pico-code-tabs h-9 gap-1'
            >
              {examples.map((example) => (
                <TabsTrigger
                  key={example.id}
                  value={example.id}
                  className='px-3 font-mono text-[11px]'
                >
                  {example.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <span className='font-mono text-[9px] tracking-wider text-white/50'>
              {t('Request example')}
            </span>
          </div>
          {examples.map((example) => (
            <TabsContent
              key={example.id}
              value={example.id}
              className='pico-code-panel m-0'
            >
              <div className='flex items-center justify-between px-5 pt-4'>
                <span className='font-mono text-[10px] text-white/50'>
                  {example.file}
                </span>
                <CopyButton
                  value={example.code}
                  size='sm'
                  className='pico-code-copy gap-2 rounded-md px-2 text-[10px]'
                  aria-label={t('Copy {{language}} example', {
                    language: example.label,
                  })}
                >
                  {t('Copy code')}
                </CopyButton>
              </div>
              <pre
                className='pico-code-content min-h-[296px] overflow-x-auto px-5 py-5 font-mono text-[11px] leading-[1.9] sm:text-[12px]'
                tabIndex={0}
                aria-label={t('{{language}} request example', {
                  language: example.label,
                })}
              >
                <code>{example.code}</code>
              </pre>
            </TabsContent>
          ))}
          <div className='flex items-start gap-2 border-t border-white/10 bg-white/[0.025] px-5 py-3 text-[11px] leading-5 text-white/60'>
            <span
              aria-hidden
              className='mt-1.5 size-1.5 shrink-0 rounded-full bg-[#8cd5d8]'
            />
            {t(
              'Replace YOUR_API_KEY with your own key. Model availability depends on your account.'
            )}
          </div>
        </Tabs>
      </div>
    </section>
  )
}
