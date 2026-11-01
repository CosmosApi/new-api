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

import { shouldShowAffiliateRewards } from '../affiliate'

describe('shouldShowAffiliateRewards', () => {
  it('shows the card once payouts are allowed', () => {
    expect(
      shouldShowAffiliateRewards(true, { aff_count: 0, aff_history_quota: 0 })
    ).toBe(true)
  })

  it('hides the card before payouts are allowed for an account without referrals', () => {
    expect(
      shouldShowAffiliateRewards(false, { aff_count: 0, aff_history_quota: 0 })
    ).toBe(false)
    expect(shouldShowAffiliateRewards(false, null)).toBe(false)
  })

  it('keeps the card for an account that already has invites or rewards', () => {
    expect(shouldShowAffiliateRewards(false, { aff_count: 2 })).toBe(true)
    expect(shouldShowAffiliateRewards(false, { aff_history_quota: 500 })).toBe(
      true
    )
  })
})
