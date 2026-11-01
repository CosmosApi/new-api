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
import { describe, expect, it } from 'vitest'

import { monthOverMonth, projectMonth, statementMonths } from '../statement'

const sec = (d: Date) => Math.floor(d.getTime() / 1000)

describe('statementMonths', () => {
  it('lists whole local months, oldest first, ending with the month in progress', () => {
    const now = sec(new Date(2027, 2, 15, 10, 0))

    const months = statementMonths(3, now)

    expect(months.map((m) => m.start)).toEqual([
      sec(new Date(2027, 0, 1)),
      sec(new Date(2027, 1, 1)),
      sec(new Date(2027, 2, 1)),
    ])
    expect(months[0].end).toBe(sec(new Date(2027, 1, 1)) - 1)
    expect(months[2]).toMatchObject({ end: now, current: true })
    expect(months.filter((m) => m.current)).toHaveLength(1)
  })

  it('crosses into the previous year', () => {
    const now = sec(new Date(2027, 0, 5))

    const [first] = statementMonths(2, now)

    expect(first.start).toBe(sec(new Date(2026, 11, 1)))
  })
})

describe('monthOverMonth', () => {
  it('reports the change against last month as a ratio', () => {
    expect(monthOverMonth(150, 100)).toBe(0.5)
  })

  it('has no change to report when last month was empty', () => {
    expect(monthOverMonth(150, 0)).toBeNull()
  })
})

describe('projectMonth', () => {
  it('scales the spend so far to the whole month', () => {
    // 1 March 00:00 to 11 March 00:00 is 10 of 31 days.
    const now = sec(new Date(2027, 2, 11))
    const [month] = statementMonths(1, now)

    expect(projectMonth(month, 100, now)).toBeCloseTo(310, 5)
  })

  it('does not project in the first days of a month', () => {
    const now = sec(new Date(2027, 2, 2))
    const [month] = statementMonths(1, now)

    expect(projectMonth(month, 100, now)).toBeNull()
  })

  it('does not project a month that has ended', () => {
    const now = sec(new Date(2027, 2, 20))
    const [past] = statementMonths(2, now)

    expect(projectMonth(past, 100, now)).toBeNull()
  })
})
