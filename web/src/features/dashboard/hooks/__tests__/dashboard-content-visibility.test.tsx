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
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { STATUS_QUERY_KEY, type StatusData } from '@/lib/status-query'

import { getUptimeStatus } from '../../api'
import { useDashboardContentVisibility } from '../use-status-data'

vi.mock('../../api', () => ({ getUptimeStatus: vi.fn() }))

let client: QueryClient | undefined

afterEach(() => {
  client?.clear()
  localStorage.clear()
})

function renderVisibility(status: StatusData) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData(STATUS_QUERY_KEY, status)
  client = queryClient
  const wrapper = (props: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
  return renderHook(() => useDashboardContentVisibility(), { wrapper })
}

const announcement = { id: 1, content: 'Maintenance tonight', type: 'info' }

describe('dashboard content panel visibility', () => {
  it('hides enabled panels that have nothing configured', () => {
    vi.mocked(getUptimeStatus).mockResolvedValue({ success: true, data: [] })

    const { result } = renderVisibility({
      api_info_enabled: true,
      api_info: [],
      announcements_enabled: true,
      announcements: [],
      faq_enabled: true,
      faq: [],
      uptime_kuma_enabled: true,
    })

    expect(result.current).toEqual({
      apiInfo: false,
      announcements: false,
      faq: false,
      uptimeKuma: false,
    })
  })

  it('shows an enabled panel once it has items', () => {
    vi.mocked(getUptimeStatus).mockResolvedValue({ success: true, data: [] })

    const { result } = renderVisibility({
      announcements_enabled: true,
      announcements: [announcement],
    })

    expect(result.current.announcements).toBe(true)
  })

  it('keeps a disabled panel hidden even when it has items', () => {
    vi.mocked(getUptimeStatus).mockResolvedValue({ success: true, data: [] })

    const { result } = renderVisibility({
      announcements_enabled: false,
      announcements: [announcement],
    })

    expect(result.current.announcements).toBe(false)
  })

  it('shows uptime only after the uptime endpoint returns a group', async () => {
    vi.mocked(getUptimeStatus).mockResolvedValue({
      success: true,
      data: [{ categoryName: 'API', monitors: [] }],
    })

    const { result } = renderVisibility({ uptime_kuma_enabled: true })

    expect(result.current.uptimeKuma).toBe(false)
    await waitFor(() => expect(result.current.uptimeKuma).toBe(true))
  })

  it('does not call the uptime endpoint when uptime is disabled', () => {
    vi.mocked(getUptimeStatus).mockClear()

    const { result } = renderVisibility({ uptime_kuma_enabled: false })

    expect(result.current.uptimeKuma).toBe(false)
    expect(getUptimeStatus).not.toHaveBeenCalled()
  })
})
