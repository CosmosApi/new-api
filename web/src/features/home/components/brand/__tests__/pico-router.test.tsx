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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'

import { STATUS_QUERY_KEY } from '@/lib/status-query'

import { PicoRouter } from '../pico-router'

let client: QueryClient | undefined

afterEach(() => {
  client?.clear()
  localStorage.clear()
})

function renderRouter() {
  client = new QueryClient({
    defaultOptions: { queries: { enabled: false, retry: false } },
  })
  client.setQueryData(STATUS_QUERY_KEY, {})
  return render(
    <QueryClientProvider client={client}>
      <PicoRouter />
    </QueryClientProvider>
  )
}

it('routes to the first model and marks only it as pressed on load', () => {
  renderRouter()

  expect(screen.getByRole('button', { name: 'Claude' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  expect(screen.getByRole('button', { name: 'GPT' })).toHaveAttribute(
    'aria-pressed',
    'false'
  )
  expect(screen.getByText('Routing to Claude')).toBeInTheDocument()
})

it('switches the route to the model the visitor picks', async () => {
  const user = userEvent.setup()
  renderRouter()

  await user.click(screen.getByRole('button', { name: 'DeepSeek' }))

  expect(screen.getByRole('button', { name: 'DeepSeek' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  expect(screen.getByRole('button', { name: 'Claude' })).toHaveAttribute(
    'aria-pressed',
    'false'
  )
  expect(await screen.findByText('Routing to DeepSeek')).toBeInTheDocument()
})

it('shows the brand name in the hub', () => {
  renderRouter()

  expect(screen.getByText('PicoAPI')).toBeInTheDocument()
})
