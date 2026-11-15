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
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PicoBloom } from '../pico-bloom'

afterEach(() => {
  vi.useRealTimers()
})

describe('PicoBloom routing illustration', () => {
  it('shows the selected provider when visitors explore routes with a pointer or keyboard', async () => {
    const user = userEvent.setup()
    render(<PicoBloom />)
    const gemini = screen.getByRole('button', {
      name: 'Route demo request to Gemini',
    })
    const claude = screen.getByRole('button', {
      name: 'Route demo request to Claude',
    })

    await user.click(gemini)
    expect(gemini).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Route demo request to OpenAI' })
    ).toHaveAttribute('aria-pressed', 'false')
    await user.tab({ shift: true })
    expect(claude).toHaveFocus()
    expect(claude).toHaveAttribute('aria-pressed', 'true')
    expect(gemini).toHaveAttribute('aria-pressed', 'false')
  })

  it('holds the chosen route while paused and continues cycling when resumed', () => {
    vi.useFakeTimers()
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }))
    render(<PicoBloom />)
    const gemini = screen.getByRole('button', {
      name: 'Route demo request to Gemini',
    })
    fireEvent.click(gemini)
    fireEvent.click(screen.getByRole('button', { name: 'Pause animation' }))
    expect(
      screen.getByRole('button', { name: 'Play animation' })
    ).toHaveAttribute('aria-pressed', 'true')

    act(() => vi.advanceTimersByTime(9000))
    expect(gemini).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Play animation' }))
    expect(
      screen.getByRole('button', { name: 'Pause animation' })
    ).toHaveAttribute('aria-pressed', 'false')
    act(() => vi.advanceTimersByTime(9000))
    expect(gemini).toHaveAttribute('aria-pressed', 'false')
  })
})
