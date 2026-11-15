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
import { expect, it } from 'vitest'

import { buildActivityMatrix } from '../../../lib/brand-overview'
import { ActivityHeatmap } from '../activity-heatmap'

const now = new Date(2027, 0, 10, 12, 0).getTime() / 1000
const monday9 = new Date(2027, 0, 4, 9, 30).getTime() / 1000
const saturday22 = new Date(2027, 0, 9, 22, 10).getTime() / 1000

it('names the busiest slot and the weekday share in plain text', () => {
  const matrix = buildActivityMatrix(
    [
      { created_at: monday9, model_name: 'm', quota: 30, count: 3 },
      { created_at: saturday22, model_name: 'm', quota: 10, count: 1 },
    ],
    now
  )

  render(<ActivityHeatmap matrix={matrix} now={now} />)

  const insight = screen.getByText(/Busiest slot/)
  expect(insight).toHaveTextContent('Busiest slot: Mon')
  expect(insight).toHaveTextContent('Weekdays account for 75% of calls.')
  expect(insight).toHaveTextContent('4 calls in total.')
})

it('says there were no calls instead of naming a slot for an empty month', () => {
  render(<ActivityHeatmap matrix={buildActivityMatrix([], now)} now={now} />)

  expect(screen.getByText('No calls in the last 4 weeks.')).toBeInTheDocument()
  expect(screen.queryByText(/Busiest slot/)).not.toBeInTheDocument()
})
