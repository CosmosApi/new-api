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

import type { TrendBucket } from '../../../lib/brand-overview'
import { SpendTrend } from '../spend-trend'

const DAY = 24 * 3600
const buckets: TrendBucket[] = Array.from({ length: 7 }, (_, i) => ({
  start: 1_800_000_000 + i * DAY,
  quota: i === 3 ? 0 : (i + 1) * 1000,
  count: i + 1,
  topModels: i === 6 ? [{ model: 'claude-sonnet', quota: 7000 }] : [],
}))

it('makes only the latest bar tabbable and walks the bars with the arrow keys', async () => {
  const user = userEvent.setup()
  render(<SpendTrend range='7d' buckets={buckets} totalQuota={27000} />)
  const bars = screen.getAllByRole('button')
  expect(bars.filter((bar) => bar.tabIndex === 0)).toEqual([bars[6]])

  await user.tab()
  expect(bars[6]).toHaveFocus()

  await user.keyboard('{ArrowLeft}')
  expect(bars[5]).toHaveFocus()

  await user.keyboard('{Home}')
  expect(bars[0]).toHaveFocus()
  expect(bars[0].tabIndex).toBe(0)
})

it('shows the bucket details, with its top models, for the focused bar', async () => {
  const user = userEvent.setup()
  render(<SpendTrend range='7d' buckets={buckets} totalQuota={27000} />)

  await user.tab()

  const tooltip = screen.getByRole('status')
  expect(tooltip).toHaveTextContent('7 calls')
  expect(tooltip).toHaveTextContent('claude-sonnet')
})

it('hides the details once the bars lose focus', async () => {
  const user = userEvent.setup()
  render(<SpendTrend range='7d' buckets={buckets} totalQuota={27000} />)
  await user.tab()

  await user.tab()

  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
