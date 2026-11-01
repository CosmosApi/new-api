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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { STATUS_QUERY_KEY, type StatusData } from '@/lib/status-query'

import { BrandHero } from '../brand-hero'

let client: QueryClient | undefined

afterEach(() => {
  client?.clear()
  localStorage.clear()
})

async function renderHero(status: StatusData, isAuthenticated = false) {
  client = new QueryClient({
    defaultOptions: { queries: { enabled: false, retry: false } },
  })
  client.setQueryData(STATUS_QUERY_KEY, status)
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => <BrandHero isAuthenticated={isAuthenticated} />,
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

// Base UI's Button keeps role="button" when it renders an <a>, so the CTA
// links are queried as buttons and checked by href.
it('links signed-out visitors to sign-up', async () => {
  await renderHero({})

  expect(
    await screen.findByRole('button', { name: 'Get Started' })
  ).toHaveAttribute('href', '/sign-up')
  expect(
    screen.queryByRole('button', { name: 'Go to Dashboard' })
  ).not.toBeInTheDocument()
})

it('links signed-in users to the dashboard', async () => {
  await renderHero({}, true)

  expect(
    await screen.findByRole('button', { name: 'Go to Dashboard' })
  ).toHaveAttribute('href', '/dashboard')
  expect(
    screen.queryByRole('button', { name: 'Get Started' })
  ).not.toBeInTheDocument()
})

it.each([{}, { system_name: 'New API' }, { system_name: '  ' }])(
  'uses the PicoAPI brand name when the system name is unset or the upstream default (%j)',
  async (status) => {
    await renderHero(status)

    expect(
      await screen.findByText(
        /^PicoAPI connects straight to each provider's official API/
      )
    ).toBeInTheDocument()
  }
)

it('uses the system name configured by the operator', async () => {
  await renderHero({ system_name: 'Acme AI' })

  expect(
    await screen.findByText(
      /^Acme AI connects straight to each provider's official API/
    )
  ).toBeInTheDocument()
})

it('names the hero heading with the slogan for the first model', async () => {
  await renderHero({})

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: "If it says Claude, it's Claude",
    })
  ).toBeInTheDocument()
})

it('hides the docs link until the operator configures one', async () => {
  await renderHero({})

  await screen.findByRole('button', { name: 'Get Started' })
  expect(screen.queryByRole('button', { name: 'Docs' })).not.toBeInTheDocument()
})

it('opens the configured docs link in a new tab', async () => {
  await renderHero({ docs_link: 'https://docs.example.com' })

  const docs = await screen.findByRole('button', { name: 'Docs' })
  expect(docs).toHaveAttribute('href', 'https://docs.example.com')
  expect(docs).toHaveAttribute('target', '_blank')
})
