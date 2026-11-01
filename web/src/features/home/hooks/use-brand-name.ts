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
import { useStatus } from '@/hooks/use-status'

// Shown until the operator sets a system name in System Settings → Site.
const DEFAULT_BRAND_NAME = 'PicoAPI'
const UPSTREAM_DEFAULT_NAME = 'New API'

/** Brand name for home page copy: the configured system name, else PicoAPI. */
export function useBrandName(): string {
  const { status } = useStatus()
  const name =
    typeof status?.system_name === 'string' ? status.system_name.trim() : ''
  if (!name || name === UPSTREAM_DEFAULT_NAME) {
    return DEFAULT_BRAND_NAME
  }
  return name
}
