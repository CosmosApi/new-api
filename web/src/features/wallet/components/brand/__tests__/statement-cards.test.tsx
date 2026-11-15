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
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { MonthSpend } from '../../../hooks/use-wallet-statement'
import type { TopupRecord } from '../../../types'
import { MonthSpendCard } from '../month-spend-card'
import { MonthlyStatement } from '../monthly-statement'
import { RecentTopups } from '../recent-topups'

const sec = (d: Date) => Math.floor(d.getTime() / 1000)

async function renderWithRouter(node: ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => node }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

const march: MonthSpend = {
  start: sec(new Date(2027, 2, 1)),
  end: sec(new Date(2027, 2, 11)),
  current: true,
  quota: 100,
}
const february: MonthSpend = {
  start: sec(new Date(2027, 1, 1)),
  end: sec(new Date(2027, 2, 1)) - 1,
  current: false,
  quota: 200,
}

describe('MonthlyStatement', () => {
  it('lists months newest first and links each to its usage log range', async () => {
    await renderWithRouter(<MonthlyStatement months={[february, march]} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveTextContent('so far')
    const href = new URL(links[1].getAttribute('href') ?? '', 'http://x')
    expect(href.pathname).toBe('/usage-logs/common')
    expect(Number(href.searchParams.get('startTime'))).toBe(
      february.start * 1000
    )
    expect(Number(href.searchParams.get('endTime'))).toBe(february.end * 1000)
  })
})

describe('MonthSpendCard', () => {
  it('projects the month from the pace so far and compares it with last month', () => {
    render(
      <MonthSpendCard
        thisMonth={march}
        lastMonth={february}
        allTime={5000}
        now={sec(new Date(2027, 2, 11))}
      />
    )

    expect(
      screen.getByText(/At this pace the month ends near/)
    ).toHaveTextContent('55% more than last month')
  })

  it('falls back to a plain caption early in the month', () => {
    render(
      <MonthSpendCard
        thisMonth={{ ...march, end: sec(new Date(2027, 2, 2)) }}
        lastMonth={february}
        allTime={5000}
        now={sec(new Date(2027, 2, 2))}
      />
    )

    expect(screen.getByText('Spent so far this month.')).toBeInTheDocument()
  })
})

describe('RecentTopups', () => {
  const record: TopupRecord = {
    id: 1,
    user_id: 1,
    amount: 10,
    money: 72,
    trade_no: 't1',
    payment_method: 'alipay',
    create_time: sec(new Date(2027, 2, 3)),
    status: 'pending',
  }

  it('flags an order that has not completed and opens the full history', async () => {
    const user = userEvent.setup()
    const onOpenHistory = vi.fn()
    render(<RecentTopups records={[record]} onOpenHistory={onOpenHistory} />)

    expect(screen.getByText('Pending')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Order history' }))

    expect(onOpenHistory).toHaveBeenCalledOnce()
  })

  it('says so when there are no top-ups', () => {
    render(<RecentTopups records={[]} onOpenHistory={() => {}} />)

    expect(screen.getByText('No top-ups yet.')).toBeInTheDocument()
  })
})
