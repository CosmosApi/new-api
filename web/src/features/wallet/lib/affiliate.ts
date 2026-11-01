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
// ============================================================================
// Affiliate Functions
// ============================================================================

/**
 * Generate affiliate registration link
 */
export function generateAffiliateLink(affCode: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/sign-up?aff=${affCode}`
}

/**
 * Whether the referral card is worth showing: payouts are allowed, or the
 * account already has invites or rewards to look at. Otherwise it would only
 * show a notice that the programme is unavailable.
 */
export function shouldShowAffiliateRewards(
  complianceConfirmed: boolean,
  user: { aff_count?: number; aff_history_quota?: number } | null
): boolean {
  return (
    complianceConfirmed ||
    (user?.aff_count ?? 0) > 0 ||
    (user?.aff_history_quota ?? 0) > 0
  )
}
