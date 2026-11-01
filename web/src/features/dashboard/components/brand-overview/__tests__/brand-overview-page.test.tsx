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
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { getApiKeys } from '@/features/keys/api'
import { getUserLogs } from '@/features/usage-logs/api'
import { getSelf } from '@/lib/api'
import { STATUS_QUERY_KEY } from '@/lib/status-query'

import { getFlowQuotaDates, getUserQuotaDates } from '../../../api'
import { BrandOverviewPage } from '../brand-overview-page'

vi.mock('../../../api', () => ({
  getUserQuotaDates: vi.fn(),
  getFlowQuotaDates: vi.fn(),
  getUptimeStatus: vi.fn(),
}))
vi.mock('@/features/keys/api', () => ({ getApiKeys: vi.fn() }))
vi.mock('@/features/usage-logs/api', () => ({ getUserLogs: vi.fn() }))
vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  getSelf: vi.fn(),
}))

const HOUR = 3600
let client: QueryClient | undefined

function nowSec() {
  return Math.floor(Date.now() / 1000)
}

function usageRow(hoursAgo: number, model: string, quota: number) {
  return {
    created_at: nowSec() - hoursAgo * HOUR,
    model_name: model,
    quota,
    count: 1,
    token_used: 1000,
  }
}

function log(id: number, extra: Record<string, unknown> = {}) {
  return {
    id,
    user_id: 1,
    created_at: nowSec() - id * 60,
    type: 2,
    content: '',
    username: 'u',
    token_name: 'production',
    model_name: 'claude-sonnet',
    quota: 500,
    prompt_tokens: 100,
    completion_tokens: 50,
    use_time: 2,
    is_stream: true,
    channel: 0,
    channel_name: '',
    token_id: 1,
    group: '',
    ip: '',
    other: '',
    request_id: '',
    upstream_request_id: '',
    ...extra,
  }
}

beforeEach(() => {
  vi.mocked(getSelf).mockResolvedValue({
    success: true,
    data: { quota: 500_000 },
  })
  vi.mocked(getFlowQuotaDates).mockResolvedValue({ success: true, data: [] })
  vi.mocked(getApiKeys).mockResolvedValue({
    success: true,
    data: { items: [], total: 0, page: 1, page_size: 100 },
  })
  vi.mocked(getUserLogs).mockResolvedValue({
    success: true,
    data: { items: [], total: 0, page: 1, page_size: 30 },
  })
})

afterEach(() => {
  client?.clear()
  localStorage.clear()
  vi.clearAllMocks()
})

async function renderPage() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(STATUS_QUERY_KEY, {})
  const router = createRouter({
    routeTree: createRootRoute({ component: BrandOverviewPage }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

it('opens on the last 7 days and sums the calls in it', async () => {
  vi.mocked(getUserQuotaDates).mockResolvedValue({
    success: true,
    data: [usageRow(2, 'claude-sonnet', 300), usageRow(48, 'gpt-mini', 100)],
  })

  await renderPage()

  expect(
    await screen.findByText(/In the last 7 days you made/)
  ).toHaveTextContent('In the last 7 days you made 2 calls')
  expect(screen.getByRole('button', { name: '7 days' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})

it('switches to 24 hours, recounts, and remembers the choice', async () => {
  const user = userEvent.setup()
  vi.mocked(getUserQuotaDates).mockResolvedValue({
    success: true,
    data: [usageRow(2, 'claude-sonnet', 300), usageRow(48, 'gpt-mini', 100)],
  })
  await renderPage()
  await screen.findByText(/In the last 7 days/)

  await user.click(screen.getByRole('button', { name: '24 hours' }))

  expect(
    await screen.findByText(/In the last 24 hours you made/)
  ).toHaveTextContent('In the last 24 hours you made 1 calls')
  expect(localStorage.getItem('picoapi:overview:range')).toBe('24h')
})

it('greets an account without calls with a link to create a key', async () => {
  vi.mocked(getUserQuotaDates).mockResolvedValue({ success: true, data: [] })

  await renderPage()

  expect(
    await screen.findByText('No calls in this period yet.')
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Create API Key' })
  ).toHaveAttribute('href', '/keys')
})

it('flags a recent call whose upstream answered with another model', async () => {
  vi.mocked(getUserQuotaDates).mockResolvedValue({ success: true, data: [] })
  vi.mocked(getUserLogs).mockResolvedValue({
    success: true,
    data: {
      items: [
        log(1),
        log(2, {
          other: JSON.stringify({
            response_model: {
              requested_model: 'claude-sonnet',
              upstream_model: '',
              returned_model: 'other-model',
            },
          }),
        }),
        log(3, { type: 1 }),
      ],
      total: 3,
      page: 1,
      page_size: 30,
    },
  })

  await renderPage()

  const list = (await screen.findByText('Recent calls')).closest('section')
  expect(list).not.toBeNull()
  const section = within(list as HTMLElement)
  expect(await section.findAllByRole('listitem')).toHaveLength(2)
  expect(section.getByText('Response model: other-model')).toBeInTheDocument()
})
