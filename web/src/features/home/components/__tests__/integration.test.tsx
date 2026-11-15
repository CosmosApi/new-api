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
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Integration } from '../sections/integration'

const status = vi.hoisted(() => ({
  docs_link: 'https://docs.example.com',
  server_address: 'https://gateway.example.com/proxy/v1/',
}))
vi.mock('@/hooks/use-status', () => ({
  useStatus: () => ({
    status,
  }),
}))

describe('Integration code examples', () => {
  it('omits the guide link without a configured docs URL and keeps custom URLs', () => {
    status.docs_link = ''
    const { rerender } = render(<Integration />)
    expect(
      screen.queryByRole('link', { name: 'Read the integration guide' })
    ).not.toBeInTheDocument()
    status.docs_link = 'https://docs.example.com'
    rerender(<Integration />)
    expect(
      screen.getByRole('link', { name: 'Read the integration guide' })
    ).toHaveAttribute('href', status.docs_link)
  })
  it('copies the currently selected language with the configured API endpoint', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    render(<Integration />)

    await user.click(screen.getByRole('tab', { name: 'Python' }))
    const pythonPanel = screen.getByRole('tabpanel')
    expect(pythonPanel).toHaveTextContent('from openai import OpenAI')
    expect(pythonPanel).toHaveTextContent(
      'https://gateway.example.com/proxy/v1'
    )
    expect(pythonPanel).not.toHaveTextContent('/v1/v1')
    await user.click(
      within(pythonPanel).getByRole('button', { name: 'Copy Python example' })
    )
    expect(writeText).toHaveBeenLastCalledWith(
      expect.stringContaining('from openai import OpenAI')
    )
    expect(
      await within(pythonPanel).findByRole('button', { name: 'Copied' })
    ).toBeVisible()

    await user.click(screen.getByRole('tab', { name: 'JavaScript' }))
    const javascriptPanel = screen.getByRole('tabpanel')
    expect(javascriptPanel).toHaveTextContent('import OpenAI from "openai"')
    await user.click(
      within(javascriptPanel).getByRole('button', {
        name: 'Copy JavaScript example',
      })
    )
    expect(writeText).toHaveBeenLastCalledWith(
      expect.stringContaining('const client = new OpenAI')
    )
  })

  it('lets keyboard users switch languages and keeps the selected tab accessible', async () => {
    const user = userEvent.setup()
    render(<Integration />)
    const curlTab = screen.getByRole('tab', { name: 'cURL' })
    await user.click(curlTab)
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'Python' })).toHaveFocus()
    expect(curlTab).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Enter}')
    expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      'client.chat.completions.create'
    )
    expect(curlTab).toHaveAttribute('aria-selected', 'false')
  })
})
