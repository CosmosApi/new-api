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
/**
 * Calendar months for the PicoAPI wallet statement, in the visitor's time
 * zone. Pure, with an explicit `now` (Unix seconds), so it is testable.
 */

export interface StatementMonth {
  /** First second of the month, local time. */
  start: number
  /** Last second of the month, or `now` for the month in progress. */
  end: number
  /** The month `now` falls in. */
  current: boolean
}

/** The last `count` months, oldest first, ending with the current one. */
export function statementMonths(count: number, now: number): StatementMonth[] {
  const today = new Date(now * 1000)
  return Array.from({ length: count }, (_, i) => {
    const offset = count - 1 - i
    const first = new Date(today.getFullYear(), today.getMonth() - offset, 1)
    const next = new Date(today.getFullYear(), today.getMonth() - offset + 1, 1)
    const start = Math.floor(first.getTime() / 1000)
    const current = offset === 0
    return {
      start,
      end: current ? now : Math.floor(next.getTime() / 1000) - 1,
      current,
    }
  })
}

/** Spend change from last month to this month, as a ratio, or null. */
export function monthOverMonth(
  thisMonth: number,
  lastMonth: number
): number | null {
  return lastMonth > 0 ? (thisMonth - lastMonth) / lastMonth : null
}

const DAY = 24 * 3600
// Before this much of the month has passed, a projection is mostly noise.
const MIN_PROJECTION_DAYS = 3

/**
 * Spend for the whole month at the pace so far, or null early in the month
 * when a few days would swing the estimate.
 */
export function projectMonth(
  month: StatementMonth,
  spent: number,
  now: number
): number | null {
  const elapsed = now - month.start
  if (!month.current || elapsed < MIN_PROJECTION_DAYS * DAY) return null
  const startDate = new Date(month.start * 1000)
  const nextMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    1
  )
  const length = Math.floor(nextMonth.getTime() / 1000) - month.start
  return (spent / elapsed) * length
}
