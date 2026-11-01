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
import { useQuery } from '@tanstack/react-query'

import { useStatus } from '@/hooks/use-status'

import { getUptimeStatus } from '../api'
import type { AnnouncementItem, ApiInfoItem, FAQItem } from '../types'

/**
 * Get specific list from status data
 */
export function useStatusData<T = unknown>(
  enabledKey: string,
  dataKey: string
): { items: T[]; loading: boolean } {
  const { status, loading } = useStatus()
  const enabled = status ? status[enabledKey] !== false : false
  const items = (enabled ? status?.[dataKey] || [] : []) as T[]

  return { items, loading }
}

/**
 * Get API info list
 */
export function useApiInfo() {
  return useStatusData<ApiInfoItem>('api_info_enabled', 'api_info')
}

/**
 * Get announcements list
 */
export function useAnnouncements() {
  return useStatusData<AnnouncementItem>(
    'announcements_enabled',
    'announcements'
  )
}

/**
 * Get FAQ list
 */
export function useFAQ() {
  return useStatusData<FAQItem>('faq_enabled', 'faq')
}

function hasItems(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0
}

/**
 * Get dashboard content panel visibility. A panel shows only when it is
 * enabled and has something to show, so an unconfigured panel never takes
 * up an empty card on the overview.
 */
export function useDashboardContentVisibility() {
  const { status } = useStatus()
  const hasStatus = Boolean(status)
  const uptimeEnabled = hasStatus && status?.uptime_kuma_enabled !== false
  // Uptime monitors are not part of /api/status; ask the uptime endpoint
  // whether any group is configured.
  const uptimeQuery = useQuery({
    queryKey: ['dashboard', 'uptime', 'configured'],
    queryFn: async () => hasItems((await getUptimeStatus())?.data),
    enabled: uptimeEnabled,
    staleTime: 5 * 60 * 1000,
  })

  return {
    apiInfo:
      hasStatus &&
      status?.api_info_enabled !== false &&
      hasItems(status?.api_info),
    announcements:
      hasStatus &&
      status?.announcements_enabled !== false &&
      hasItems(status?.announcements),
    faq: hasStatus && status?.faq_enabled !== false && hasItems(status?.faq),
    uptimeKuma: uptimeEnabled && uptimeQuery.data === true,
  }
}
