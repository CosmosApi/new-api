import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, expect, test, vi } from 'vitest'

import { api } from '@/lib/api'

import { MarketplaceSourcesDialog } from '../components/marketplace-sources-dialog'

const clients: QueryClient[] = []

function SourcesFixture() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button type='button' onClick={() => setOpen(true)}>
        Open sources
      </button>
      <MarketplaceSourcesDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

function renderSources() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  clients.push(client)
  render(
    <QueryClientProvider client={client}>
      <SourcesFixture />
    </QueryClientProvider>
  )
}

afterEach(() => {
  cleanup()
  for (const client of clients) client.clear()
  clients.length = 0
  vi.restoreAllMocks()
})

test('an empty source list stays empty until the administrator adds and saves a custom source', async () => {
  vi.spyOn(api, 'get').mockResolvedValue({ data: { success: true, data: [] } })
  const source = {
    name: 'Mirror',
    index_url: 'https://plugins.example/index.json',
  }
  const save = vi
    .spyOn(api, 'put')
    .mockResolvedValue({ data: { success: true, data: [source] } })
  const user = userEvent.setup()
  renderSources()
  expect(
    await screen.findByText('No marketplace sources configured.')
  ).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Add source' }))
  await user.type(
    screen.getByRole('textbox', { name: 'Source name' }),
    source.name
  )
  await user.type(
    screen.getByRole('textbox', { name: 'Index URL' }),
    source.index_url
  )
  await user.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(save).toHaveBeenCalled())
  expect(save.mock.calls[0][1]).toEqual([source])
})

test('closing without saving discards draft edits when the source editor reopens', async () => {
  vi.spyOn(api, 'get').mockResolvedValue({
    data: {
      success: true,
      data: [
        { name: 'Mirror', index_url: 'https://plugins.example/index.json' },
      ],
    },
  })
  const user = userEvent.setup()
  renderSources()
  const input = await screen.findByDisplayValue('Mirror')
  await user.clear(input)
  await user.type(input, 'Unsaved')
  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  await user.click(screen.getByRole('button', { name: 'Open sources' }))
  expect(await screen.findByDisplayValue('Mirror')).toBeVisible()
  expect(screen.queryByDisplayValue('Unsaved')).not.toBeInTheDocument()
})
