import { render, screen } from '@testing-library/react'
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
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import { Footer } from '../footer'

const config = vi.hoisted(() => ({
  systemName: 'PicoAPI',
  footerHtml: '',
  demoSiteEnabled: true,
}))
const status = vi.hoisted(() => ({
  user_agreement_enabled: true,
  privacy_policy_enabled: true,
}))

vi.mock('@/hooks/use-system-config', () => ({ useSystemConfig: () => config }))
vi.mock('@/hooks/use-status', () => ({ useStatus: () => ({ status }) }))
vi.mock('@tanstack/react-router', () => ({
  Link: (props: { to: string; children: ReactNode }) => (
    <a href={props.to}>{props.children}</a>
  ),
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

it.each([
  ['localhost', ''],
  ['127.0.0.1', ''],
  ['[::1]', '<p>Custom footer copy</p>'],
  ['picoapi.example', ''],
  ['picoapi.example', '<p>Custom footer copy</p>'],
])('omits the upstream attribution on %s', (hostname, footerHtml) => {
  vi.stubGlobal('location', new URL(`http://${hostname}:3000`))
  config.footerHtml = footerHtml

  render(<Footer />)

  expect(
    screen.queryByRole('link', { name: 'New API' })
  ).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'User Agreement' })).toHaveAttribute(
    'href',
    '/user-agreement'
  )
  expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
    'href',
    '/privacy-policy'
  )
  expect(
    screen
      .getAllByRole('link')
      .every((link) => link.getAttribute('href')?.startsWith('/'))
  ).toBe(true)
})

it('keeps explicitly configured footer links', () => {
  config.footerHtml = ''
  render(
    <Footer
      columns={[
        {
          title: 'Docs',
          links: [{ text: 'Guide', href: 'https://docs.example/guide' }],
        },
      ]}
    />
  )
  expect(screen.getByRole('link', { name: 'Guide' })).toHaveAttribute(
    'href',
    'https://docs.example/guide'
  )
  expect(screen.getByRole('link', { name: /PicoAPI/ })).toBeInTheDocument()
})
