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
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import type { Runway } from '../../../lib/brand-overview'
import { RunwayCard } from '../runway-card'

async function renderCard(runway: Runway) {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => <RunwayCard balance={500_000} runway={runway} />,
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

function litDots(): number {
  const meter = screen.getByRole('img')
  return [...meter.children].filter(
    (dot) => !dot.className.includes('bg-border')
  ).length
}

it('lights one dot per day of runway and names the run-out date', async () => {
  await renderCard({
    state: 'ok',
    days: 10.4,
    depletesAt: 1_800_000_000,
    averageDailyQuota: 50_000,
  })

  expect(litDots()).toBe(11)
  expect(screen.getByRole('img')).toHaveAccessibleName(
    /lasts about 10 days, until around/
  )
})

it('caps the meter at 30 dots for a long runway', async () => {
  await renderCard({
    state: 'ok',
    days: 120,
    depletesAt: 1_800_000_000,
    averageDailyQuota: 1,
  })

  expect(litDots()).toBe(30)
  expect(screen.getByText(/showing the first 30/)).toBeInTheDocument()
})

it('lights no dots and explains why when there is no recent usage', async () => {
  await renderCard({
    state: 'idle',
    days: null,
    depletesAt: null,
    averageDailyQuota: 0,
  })

  expect(litDots()).toBe(0)
  expect(screen.getByRole('img')).toHaveAccessibleName(
    /No calls in the last 7 days/
  )
})

it('says the balance has run out and links to the wallet to top up', async () => {
  await renderCard({
    state: 'empty',
    days: 0,
    depletesAt: null,
    averageDailyQuota: 10,
  })

  expect(screen.getByRole('img')).toHaveAccessibleName(/balance has run out/)
  expect(litDots()).toBe(0)
  expect(screen.getByRole('button', { name: 'Top up' })).toHaveAttribute(
    'href',
    '/wallet'
  )
})
