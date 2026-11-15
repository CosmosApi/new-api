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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'

import { KeysDemo, LogsDemo } from '../feature-demos'

it('turns a key off and updates its status label when its switch is clicked', async () => {
  const user = userEvent.setup()
  render(<KeysDemo />)
  const toggle = screen.getByRole('switch', { name: 'Enable key production' })
  expect(toggle).toBeChecked()

  await user.click(toggle)

  expect(toggle).not.toBeChecked()
  expect(screen.queryByText('Enabled')).not.toBeInTheDocument()
  expect(screen.getAllByText('Disabled')).toHaveLength(2)
})

it('turns a disabled key on when its switch is clicked', async () => {
  const user = userEvent.setup()
  render(<KeysDemo />)
  const toggle = screen.getByRole('switch', { name: 'Enable key dev-laptop' })
  expect(toggle).not.toBeChecked()

  await user.click(toggle)

  expect(toggle).toBeChecked()
  expect(screen.getAllByText('Enabled')).toHaveLength(2)
})

it('shows a fixed set of four log rows under reduced motion', () => {
  render(<LogsDemo />)

  expect(screen.getAllByRole('listitem')).toHaveLength(4)
})
